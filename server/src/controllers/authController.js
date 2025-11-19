const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Access token short lived, refresh token long lived
const signAccessToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
const signRefreshToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const getCookieOptions = (ttlMs = 7 * 24 * 60 * 60 * 1000, httpOnly = true) => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: ttlMs
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

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
  // Debug: log origin
  console.log('auth.register: origin=', req.headers.origin, 'CLIENT_URL=', process.env.CLIENT_URL);
    // set httpOnly cookies for tokens
  // store hashed refresh token on user for rotation/revocation
  const refreshHash = await bcrypt.hash(refreshToken, 10);
  user.refreshTokenHash = refreshHash;
  await user.save();
  res.cookie('token', accessToken, getCookieOptions(15 * 60 * 1000, true)); // 15m
  res.cookie('refreshToken', refreshToken, getCookieOptions()); // 7d
    // also expose a non-httpOnly 'session' cookie so client JS can read a session token if needed
    res.cookie('session', accessToken, getCookieOptions(15 * 60 * 1000, false));
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken
    });
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

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    console.log('auth.login: origin=', req.headers.origin, 'CLIENT_URL=', process.env.CLIENT_URL);
  // save hashed refresh token
  const refreshHash = await bcrypt.hash(refreshToken, 10);
  user.refreshTokenHash = refreshHash;
  await user.save();
  res.cookie('token', accessToken, getCookieOptions(15 * 60 * 1000, true));
  res.cookie('refreshToken', refreshToken, getCookieOptions());
  res.cookie('session', accessToken, getCookieOptions(15 * 60 * 1000, false));
  res.json({ user: { id: user.id, email: user.email, name: user.name }, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    // try cookie first then body
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token provided' });
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    const userId = payload.userId;
    const user = await User.findById(userId);
    if (!user || !user.refreshTokenHash) return res.status(401).json({ error: 'Refresh token revoked' });
    // verify provided token matches stored hash
    const matches = await bcrypt.compare(token, user.refreshTokenHash);
    if (!matches) return res.status(401).json({ error: 'Refresh token revoked or invalid' });

    // rotate tokens: issue new refresh token and replace stored hash
    const accessToken = signAccessToken(userId);
    const refreshToken = signRefreshToken(userId);
    const newHash = await bcrypt.hash(refreshToken, 10);
    user.refreshTokenHash = newHash;
    await user.save();

    // set cookies and return tokens
    res.cookie('token', accessToken, getCookieOptions(15 * 60 * 1000, true));
    res.cookie('refreshToken', refreshToken, getCookieOptions());
    res.cookie('session', accessToken, getCookieOptions(15 * 60 * 1000, false));
    res.json({ accessToken, refreshToken });
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
  // clear cookies we set
  res.clearCookie('token', { ...opts, maxAge: 0 });
  res.clearCookie('refreshToken', { ...opts, maxAge: 0 });
  res.clearCookie('session', { ...opts, maxAge: 0 });
  // also clear stored refresh token hash for this user (if authenticated)
  try {
    if (req.userId) {
      const user = await User.findById(req.userId);
      if (user) {
        user.refreshTokenHash = undefined;
        await user.save();
      }
    }
  } catch (e) {
    console.error('logout: failed to clear refresh token hash', e);
  }
  res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};