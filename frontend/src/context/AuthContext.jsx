import { createContext, useContext, useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import useLocalStorage from '../hooks/useLocalStorage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// ─── Normalize any phone input to a clean 10-digit local number ──────────────
// The backend authController will then format it to full E.164 (+91XXXXXXXXXX)
// Examples handled:
//   "9876543210"      → "9876543210"   (already clean)
//   "91+9876543210"   → "9876543210"   (Twilio bug format — fixed)
//   "+919876543210"   → "9876543210"   (full E.164 input)
//   "09876543210"     → "9876543210"   (leading zero stripped)
//   "919876543210"    → "9876543210"   (country code without plus)
const normalizePhone = (rawPhone) => {
  // Remove everything except digits
  let digits = String(rawPhone).replace(/\D/g, '');

  // Strip leading 91 country code if number is 12 digits
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }

  // Strip leading zero if 11 digits (e.g. "09876543210")
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits; // Returns clean 10-digit number
};

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useLocalStorage('userInfo', null);
  const [loading, setLoading] = useState(true);

  // This ref prevents checkUser from running twice in React Strict Mode
  // React Strict Mode intentionally double-invokes effects in development
  // to help detect side effects — this guard stops the double API call
  const hasCheckedUser = useRef(false);

  useEffect(() => {
    const checkUser = async () => {
      // Guard: only run once even if React Strict Mode double-invokes this effect
      if (hasCheckedUser.current) return;
      hasCheckedUser.current = true;

      if (userInfo && userInfo.token) {
        try {
          const { data } = await api.get('/api/auth/me');
          setUserInfo({ ...data, token: userInfo.token });
        } catch (error) {
          console.error('Session expired or token invalid:', error);
          setUserInfo(null);
        }
      }
      setLoading(false);
    };

    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (identifier, password) => {
    const { data } = await api.post('/api/auth/login', { identifier, password });
    setUserInfo(data);
    return data;
  };

  const register = async (name, email, phone, password) => {
    const cleanPhone = phone ? normalizePhone(phone) : undefined;
    const { data } = await api.post('/api/auth/register', {
      name,
      email,
      phone: cleanPhone,
      password,
    });
    setUserInfo(data);
    return data;
  };

  // sendOtp and verifyOtp MUST use the same normalized phone so the backend
  // Map key always matches between the two calls
  const sendOtp = async (phone) => {
    const cleanPhone = normalizePhone(phone);

    if (cleanPhone.length !== 10) {
      throw new Error('Please enter a valid 10-digit mobile number');
    }

    const { data } = await api.post('/api/auth/send-otp', { phone: cleanPhone });
    return data;
  };

  const verifyOtp = async (phone, otp) => {
    // Use the exact same normalization as sendOtp so the Map key matches
    const cleanPhone = normalizePhone(phone);
    const cleanOtp = String(otp).trim();

    const { data } = await api.post('/api/auth/verify-otp', {
      phone: cleanPhone,
      otp: cleanOtp,
    });

    setUserInfo(data);
    return data;
  };

  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
  };

  const updateUser = async (updateData) => {
    // Normalize phone if it is being updated
    const payload = { ...updateData };
    if (payload.phone) {
      payload.phone = normalizePhone(payload.phone);
    }
    const { data } = await api.put('/api/auth/me', payload);
    setUserInfo({ ...data, token: userInfo.token });
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        loading,
        login,
        register,
        logout,
        updateUser,
        sendOtp,
        verifyOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};