function requireAdmin(req, res, next) {
  // make sure auth ran first and set req.user
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: missing authenticated user' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }
  next();
}

module.exports = requireAdmin;
module.exports.requireAdmin = requireAdmin;
