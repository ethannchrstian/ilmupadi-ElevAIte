const jwtConfig = require('../config/jwt');
const { User } = require('../models');
const { createErrorResponse } = require('../utils/responseHelper');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json(
        createErrorResponse('Access denied', 'Authentication token required')
      );
    }

    const decoded = jwtConfig.verifyToken(token);
    
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json(
        createErrorResponse('Access denied', 'Invalid token or user not found')
      );
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(
        createErrorResponse('Access denied', 'Invalid token')
      );
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        createErrorResponse('Access denied', 'Token expired')
      );
    }

    return res.status(500).json(
      createErrorResponse('Authentication failed', 'Internal server error')
    );
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json(
      createErrorResponse('Access denied', 'Admin privileges required')
    );
  }
  next();
};

const requireOwnershipOrAdmin = (paramName = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[paramName];
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && resourceUserId != currentUserId) {
      return res.status(403).json(
        createErrorResponse('Access denied', 'You can only access your own resources')
      );
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwtConfig.verifyToken(token);
      const user = await User.findByPk(decoded.id);
      
      if (user && user.is_active) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
  optionalAuth
};