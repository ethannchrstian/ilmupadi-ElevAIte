const { User } = require('../models');
const jwtConfig = require('../config/jwt');
const { createSuccessResponse, createErrorResponse } = require('../utils/responseHelper');
const { validateRegister, validateLogin } = require('../validations/authValidation');

const authController = {
  register: async (req, res) => {
    try {
      const { error, value } = validateRegister(req.body);
      if (error) {
        return res.status(400).json(
          createErrorResponse('Validation error', error.details[0].message)
        );
      }

      const { name, email, password } = value;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json(
          createErrorResponse('Registration failed', 'Email already registered')
        );
      }

      const user = await User.create({
        name,
        email,
        password
      });

      const payload = { id: user.id, email: user.email, role: user.role };
      const token = jwtConfig.generateToken(payload);
      const refreshToken = jwtConfig.generateRefreshToken(payload);

      await user.update({ refresh_token: refreshToken });

      await user.updateLastLogin();

      res.status(201).json(
        createSuccessResponse('User registered successfully', {
          user: user.toJSON(),
          token,
          refreshToken
        })
      );

    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json(
        createErrorResponse('Registration failed', 'Internal server error')
      );
    }
  },

  login: async (req, res) => {
    try {
      const { error, value } = validateLogin(req.body);
      if (error) {
        return res.status(400).json(
          createErrorResponse('Validation error', error.details[0].message)
        );
      }

      const { email, password } = value;

      const user = await User.findOne({ where: { email } });
      if (!user || !user.is_active) {
        return res.status(401).json(
          createErrorResponse('Login failed', 'Invalid credentials')
        );
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json(
          createErrorResponse('Login failed', 'Invalid credentials')
        );
      }

      const payload = { id: user.id, email: user.email, role: user.role };
      const token = jwtConfig.generateToken(payload);
      const refreshToken = jwtConfig.generateRefreshToken(payload);

      await user.update({ refresh_token: refreshToken });
      await user.updateLastLogin();

      res.json(
        createSuccessResponse('Login successful', {
          user: user.toJSON(),
          token,
          refreshToken
        })
      );

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json(
        createErrorResponse('Login failed', 'Internal server error')
      );
    }
  },
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json(
          createErrorResponse('Token refresh failed', 'Refresh token required')
        );
      }

      const decoded = jwtConfig.verifyToken(refreshToken);
      
      const user = await User.findOne({ 
        where: { 
          id: decoded.id,
          refresh_token: refreshToken 
        } 
      });

      if (!user || !user.is_active) {
        return res.status(401).json(
          createErrorResponse('Token refresh failed', 'Invalid refresh token')
        );
      }

      const payload = { id: user.id, email: user.email, role: user.role };
      const newToken = jwtConfig.generateToken(payload);
      const newRefreshToken = jwtConfig.generateRefreshToken(payload);

      await user.update({ refresh_token: newRefreshToken });

      res.json(
        createSuccessResponse('Token refreshed successfully', {
          token: newToken,
          refreshToken: newRefreshToken
        })
      );

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json(
        createErrorResponse('Token refresh failed', 'Invalid or expired refresh token')
      );
    }
  },

  logout: async (req, res) => {
    try {
      const userId = req.user.id;

      await User.update(
        { refresh_token: null },
        { where: { id: userId } }
      );

      res.json(
        createSuccessResponse('Logout successful', null)
      );

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json(
        createErrorResponse('Logout failed', 'Internal server error')
      );
    }
  },

  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        include: [{
          model: require('../models').Detection,
          as: 'detections',
          limit: 5,
          order: [['created_at', 'DESC']],
          attributes: ['id', 'plant_type', 'disease', 'confidence', 'created_at']
        }]
      });

      if (!user) {
        return res.status(404).json(
          createErrorResponse('User not found', 'User does not exist')
        );
      }

      res.json(
        createSuccessResponse('Profile retrieved successfully', user)
      );

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json(
        createErrorResponse('Failed to get profile', 'Internal server error')
      );
    }
  },

  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { name } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json(
          createErrorResponse('Validation error', 'Name is required')
        );
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json(
          createErrorResponse('User not found', 'User does not exist')
        );
      }

      await user.update({ name: name.trim() });

      res.json(
        createSuccessResponse('Profile updated successfully', user.toJSON())
      );

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json(
        createErrorResponse('Failed to update profile', 'Internal server error')
      );
    }
  },

  changePassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json(
          createErrorResponse('Validation error', 'Current password and new password are required')
        );
      }

      if (newPassword.length < 6) {
        return res.status(400).json(
          createErrorResponse('Validation error', 'New password must be at least 6 characters long')
        );
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json(
          createErrorResponse('User not found', 'User does not exist')
        );
      }

      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json(
          createErrorResponse('Password change failed', 'Current password is incorrect')
        );
      }

      await user.update({ password: newPassword });

      res.json(
        createSuccessResponse('Password changed successfully', null)
      );

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json(
        createErrorResponse('Failed to change password', 'Internal server error')
      );
    }
  }
};

module.exports = authController;