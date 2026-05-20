const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const twilio = require('twilio');

const otpStore = new Map(); // Temporary in-memory store for OTPs


// ─── Utility: Normalize any phone input to strict E.164 format ───────────────
// Accepts inputs like: "9608887456", "91+9608887456", "+919608887456", "09608887456"
// Always returns: "+919608887456"
const formatToE164 = (rawPhone) => {
  // Step 1: Remove everything except digits and the plus sign
  let cleaned = rawPhone.replace(/[^\d+]/g, '');

  // Step 2: Remove any plus sign that is NOT at the very beginning
  // This fixes the "91+9608887456" bug where plus appears in the middle
  cleaned = cleaned.replace(/(?<!^)\+/g, '');

  // Step 3: If there is no leading plus, we assume India country code 91
  // Strip any leading zero first (e.g. "09876543210" becomes "9876543210")
  if (!cleaned.startsWith('+')) {
    cleaned = cleaned.replace(/^0+/, ''); // remove leading zeros
    // If the number is exactly 10 digits, it is a local Indian number — prepend +91
    if (cleaned.length === 10) {
      cleaned = '+91' + cleaned;
    } else {
      // Already has country code digits (e.g. "919876543210") — just add the plus
      cleaned = '+' + cleaned;
    }
  }

  return cleaned;
};


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!email && !phone) {
      res.status(400);
      throw new Error('Please provide either email or phone number');
    }

    let userExists;
    if (email) {
      userExists = await User.findOne({ email });
    } else if (phone) {
      const formattedPhone = formatToE164(phone);
      userExists = await User.findOne({ phone: formattedPhone });
    }

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email: email || undefined,
      phone: phone ? formatToE164(phone) : undefined,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};


// @desc    Auth user and get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, phone, identifier, password } = req.body;

    const loginIdentifier = email || phone || identifier;

    if (!loginIdentifier) {
      res.status(400);
      throw new Error('Please provide email or phone number');
    }

    // Normalize the identifier in case it is a phone number
    const normalizedIdentifier = formatToE164(loginIdentifier);

    const user = await User.findOne({
      $or: [
        { email: loginIdentifier },
        { phone: normalizedIdentifier },
        { phone: loginIdentifier }, // fallback: match whatever is stored
      ]
    });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    next(error);
  }
};


// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};


// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.address) user.address = req.body.address;
      if (req.body.phone) user.phone = formatToE164(req.body.phone);

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        address: updatedUser.address,
        phone: updatedUser.phone,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Update User Profile Error:', error);
    next(error);
  }
};


// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const { oldPassword, newPassword } = req.body;

      if (!(await user.matchPassword(oldPassword))) {
        res.status(401);
        throw new Error('Incorrect old password');
      }

      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};


// @desc    Send OTP to phone
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    console.log(`[OTP] Request received for phone: ${phone}`);

    if (!phone) {
      res.status(400);
      throw new Error('Please provide a phone number');
    }

    // Always normalize to E.164 before storing or sending
    // This is the single source of truth for the phone key used in otpStore
    const formattedPhone = formatToE164(phone);

    // Validate the result looks like a proper E.164 number
    if (!/^\+\d{10,15}$/.test(formattedPhone)) {
      res.status(400);
      throw new Error('Invalid phone number format. Please enter a valid 10-digit number.');
    }

    // Generate a 6 digit OTP (more secure than 4 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store it using the normalized phone number as the key, with 5 minute expiration
    otpStore.set(formattedPhone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    console.log(`[DEV OTP] OTP for ${formattedPhone} is ${otp}`);

    // Try to send real SMS via Twilio if credentials are configured
    let smsSent = false;
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER &&
      !process.env.TWILIO_ACCOUNT_SID.includes('your_twilio')
    ) {
      try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: `Your LuxeStore verification code is: ${otp}. Valid for 5 minutes. Do not share this with anyone.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone,
        });
        smsSent = true;
        console.log(`[SMS] OTP sent successfully to ${formattedPhone}`);
      } catch (twilioError) {
        console.error('[Twilio Error Handled]:', twilioError.message);
        if (twilioError.message.includes('unverified')) {
          console.warn('👉 Tip: Twilio trial accounts can only send to verified numbers.');
        }
      }
    } else {
      console.log('[OTP] Falling back to Dev Mode (Twilio not configured).');
    }

    return res.status(200).json({
      success: true,
      message: smsSent ? 'OTP sent successfully via SMS' : 'OTP generated (Dev Mode)',
      devOtp: process.env.NODE_ENV === 'development' || !smsSent ? otp : undefined,
    });
  } catch (error) {
    console.error('[sendOtp Crash Prevented]:', error.message);
    next(error);
  }
};


// @desc    Verify OTP and Login or Register user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    console.log('=== VERIFY OTP DEBUG ===');
    console.log('Body received:', req.body);
    console.log('OTP Store contents:', [...otpStore.entries()]);

    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400);
      throw new Error('Please provide phone number and OTP');
    }

    // Normalize using the same function as send-otp so the Map key always matches
    const formattedPhone = formatToE164(phone);
    console.log('Formatted phone for lookup:', formattedPhone);

    const storedOtpData = otpStore.get(formattedPhone);

    if (!storedOtpData) {
      res.status(400);
      throw new Error('OTP not found or expired. Please request a new OTP.');
    }

    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(formattedPhone);
      res.status(400);
      throw new Error('OTP has expired. Please request a new OTP.');
    }

    if (storedOtpData.otp !== otp.toString().trim()) {
      res.status(400);
      throw new Error('Invalid OTP. Please check and try again.');
    }

    // ── Find or create user BEFORE deleting OTP from store ────────────────────
    // CRITICAL: Only delete the OTP after the database operation succeeds.
    // If we delete first and the DB call crashes, the user can never retry
    // because the OTP is already gone from the Map.

    let user = await User.findOne({ phone: formattedPhone });

    if (!user) {
      // New user — create with a random secure password since they log in via OTP
      // The password field is required by the User schema, so we must provide one.
      // This password is never used for OTP-based login — it is just a schema placeholder.
      const randomPassword = Math.random().toString(36).slice(-12) +
                             Math.random().toString(36).slice(-12);

      user = await User.create({
        name: 'User ' + formattedPhone.slice(-4),
        phone: formattedPhone,
        password: randomPassword,
      });
    }

    // Only delete OTP now that the DB operation has succeeded
    otpStore.delete(formattedPhone);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('verifyOtp error:', error.message);
    next(error);
  }
};


module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  sendOtp,
  verifyOtp,
};