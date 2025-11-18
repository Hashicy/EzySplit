const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,           // true on HTTPS
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed, name });

    const token = signToken(user.id);
  // Debug: log origin and cookie options to help diagnose cross-site cookie issues
  console.log('auth.register: origin=', req.headers.origin, 'CLIENT_URL=', process.env.CLIENT_URL, 'cookieOptions=', getCookieOptions());
  res.cookie('token', token, getCookieOptions());
    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user.id);
  // Debug: log origin and cookie options to help diagnose cross-site cookie issues
  console.log('auth.login: origin=', req.headers.origin, 'CLIENT_URL=', process.env.CLIENT_URL, 'cookieOptions=', getCookieOptions());
  res.cookie('token', token, getCookieOptions());
    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
  const user = await User.findById(req.userId).select('_id email name');
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const opts = getCookieOptions();
    res.clearCookie('token', { ...opts, maxAge: 0 });
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};