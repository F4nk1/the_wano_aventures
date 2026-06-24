const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');

// Auth Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No autorizado. Token faltante.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalido o expirado.' });
  }
};

module.exports = { authMiddleware };
