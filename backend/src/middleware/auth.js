import { verifyToken } from '../config/jwt.js';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication token required',
        details: {}
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
        details: {}
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 'AUTH_ERROR',
      message: 'Authentication failed',
      details: { error: error.message }
    });
  }
};

