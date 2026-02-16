import { verifyToken } from '../utils/jwtUtils.js';

export const authenticate = (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies?.authToken;

    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
    }

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

export const adminOnly = (req, res, next) => {
  try {
    if (req.user?.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(403).json({ message: 'Authorization failed', error: error.message });
  }
};

export const userAuth = (req, res, next) => {
  try {
    if (req.user?.type !== 'user') {
      return res.status(403).json({ message: 'User access required' });
    }
    next();
  } catch (error) {
    res.status(403).json({ message: 'Authorization failed', error: error.message });
  }
};
