import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiPhone, FiKey } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Normalizes user phone input to a clean 10-digit string before sending to backend
// The backend authController will then convert it to full E.164 format (+91XXXXXXXXXX)
const sanitizePhone = (rawPhone) => {
  // Remove all non-digit characters
  const digitsOnly = rawPhone.replace(/\D/g, '');
  // If the user typed the full number with country code like "919876543210", strip the leading 91
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return digitsOnly.slice(2);
  }
  return digitsOnly;
};

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Enter Phone, 2 = Enter OTP
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0); // countdown in seconds

  // This ref prevents the send-OTP API from being called more than once at a time
  // even if the button is clicked rapidly or React re-renders mid-flight
  const isSendingRef = useRef(false);
  const timerRef = useRef(null);

  const { sendOtp, verifyOtp, userInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, userInfo, redirect]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Starts a 30-second resend countdown
  const startResendTimer = () => {
    setResendTimer(30);
    timerRef.current = setInterval(() => {
      setResendTimer((previous) => {
        if (previous <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();

    const cleanPhone = sanitizePhone(phone);

    if (!cleanPhone || cleanPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    // Guard against double submissions — this is the key fix for the duplicate OTP bug
    if (isSendingRef.current || isSubmitting) return;
    isSendingRef.current = true;

    try {
      setIsSubmitting(true);
      // Send the clean 10-digit number; backend will prepend +91
      const result = await sendOtp(cleanPhone);

      if (result && result.devOtp) {
        toast.info(`DEV MODE: Your OTP is ${result.devOtp}`, { autoClose: false });
      } else {
        toast.success('OTP sent to your mobile number!');
      }

      setOtp(''); // clear any old OTP in state
      setStep(2);
      startResendTimer();
    } catch (error) {
      console.error('OTP Send Error:', error);
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to send OTP. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
      isSendingRef.current = false;
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isSendingRef.current || isSubmitting) return;

    const cleanPhone = sanitizePhone(phone);

    isSendingRef.current = true;
    try {
      setIsSubmitting(true);
      setOtp('');
      const result = await sendOtp(cleanPhone);

      if (result && result.devOtp) {
        toast.info(`DEV MODE: Your new OTP is ${result.devOtp}`, { autoClose: false });
      } else {
        toast.success('A new OTP has been sent!');
      }

      startResendTimer();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
      isSendingRef.current = false;
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    const trimmedOtp = otp.trim();

    if (!trimmedOtp || trimmedOtp.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const cleanPhone = sanitizePhone(phone);
      await verifyOtp(cleanPhone, trimmedOtp);
      toast.success('Login successful! Welcome back.');
      // Navigation is handled by the useEffect above watching userInfo
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Invalid OTP. Please check and try again.');
      setIsSubmitting(false);
    }
  };

  const handleChangeNumber = () => {
    setStep(1);
    setOtp('');
    setResendTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Only allow digit input for OTP field
  const handleOtpChange = (event) => {
    const value = event.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  // Only allow digit input for phone field
  const handlePhoneChange = (event) => {
    const value = event.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-gray-100">

        <div>
          <h2 className="mt-2 text-center text-3xl font-serif font-bold text-darkText">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 1
              ? 'Sign in with your mobile number'
              : `Enter the 6-digit OTP sent to +91 ${phone}`}
          </p>
        </div>

        {/* ── Step 1: Phone Number Entry ─────────────────────── */}
        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiPhone />
                </div>
                {/* Static country code prefix */}
                <span className="absolute inset-y-0 left-8 flex items-center text-gray-500 text-sm font-medium pr-1">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  className="pl-16 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                  placeholder="9876543210"
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  autoFocus
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">Enter your 10-digit number without the country code</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || phone.length !== 10}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP Verification ───────────────────────── */}
        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                <button
                  type="button"
                  onClick={handleChangeNumber}
                  className="text-xs text-accent hover:underline"
                >
                  Change Number
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiKey />
                </div>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={handleOtpChange}
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors tracking-widest text-center text-lg"
                  placeholder="••••••"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">Enter the 6-digit OTP from the SMS</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verifying...' : 'Verify OTP and Sign In'}
            </button>

            {/* Resend OTP */}
            <div className="text-center text-sm text-gray-500">
              {resendTimer > 0 ? (
                <span>Resend OTP in <span className="font-semibold text-primary">{resendTimer}s</span></span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSubmitting}
                  className="text-accent font-medium hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default LoginPage;