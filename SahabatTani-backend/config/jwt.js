const jwt = require('jsonwebtoken');

const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  generateToken: (payload) => {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
      issuer: 'plant-disease-detection-api'
    });
  },
  
  verifyToken: (token) => {
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  },
  
  decodeToken: (token) => {
    return jwt.decode(token);
  },
  
  generateRefreshToken: (payload) => {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: '30d',
      issuer: 'sahabat-tani-api'
    });
  }
};

module.exports = jwtConfig;