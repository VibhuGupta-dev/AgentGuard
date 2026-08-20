const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_agentci_jwt_key_12345';

const authMiddleware = (req, res, next) => {
  let token = null;

  // 1. Fetch from HTTP-Only cookie
  if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }
  // 2. Fallback: Check authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, session token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (err) {
    console.error('[AuthMiddleware] JWT Token verification failed:', err.message);
    return res.status(401).json({ error: 'Session expired or invalid token' });
  }
};

module.exports = authMiddleware;
