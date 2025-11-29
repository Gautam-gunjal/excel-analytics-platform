const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  // accept Authorization (Bearer ...), lower-case, or x-access-token as a fallback
  const header =
    req.header('Authorization') ||
    req.header('authorization') ||
    req.header('x-access-token');

  const token = header ? (header.startsWith('Bearer ') ? header.split(' ')[1] : header) : null;

  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach user (without password) to req
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'Invalid token' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = requireAuth;
module.exports.requireAuth = requireAuth;
