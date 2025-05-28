/**
 * Create a standardized success response
 * @param {string} message - Success message
 * @param {any} data - Response data
 * @param {object} meta - Additional metadata (pagination, etc.)
 * @returns {object} Formatted response object
 */
const createSuccessResponse = (message, data = null, meta = null) => {
  const response = {
    status: 'success',
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return response;
};

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {string|array} errors - Detailed error information
 * @param {string} code - Error code
 * @returns {object} Formatted error response object
 */
const createErrorResponse = (message, errors = null, code = null) => {
  const response = {
    status: 'error',
    message,
    timestamp: new Date().toISOString()
  };

  if (errors !== null) {
    response.errors = Array.isArray(errors) ? errors : [errors];
  }

  if (code !== null) {
    response.code = code;
  }

  return response;
};

/**
 * Create a paginated response
 * @param {array} data - Array of data items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @param {string} message - Success message
 * @returns {object} Formatted paginated response
 */
const createPaginatedResponse = (data, page, limit, total, message = 'Data retrieved successfully') => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return createSuccessResponse(message, data, {
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    }
  });
};

/**
 * Create a validation error response
 * @param {object} validationErrors - Joi validation errors
 * @returns {object} Formatted validation error response
 */
const createValidationErrorResponse = (validationErrors) => {
  const errors = validationErrors.details.map(error => ({
    field: error.path.join('.'),
    message: error.message,
    value: error.context?.value
  }));

  return createErrorResponse('Validation failed', errors, 'VALIDATION_ERROR');
};

/**
 * Handle async route errors
 * @param {function} fn - Async route handler function
 * @returns {function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Create a response for file upload success
 * @param {string} fileName - Name of uploaded file
 * @param {string} filePath - Path to uploaded file
 * @param {number} fileSize - Size of uploaded file
 * @param {string} message - Success message
 * @returns {object} Formatted file upload response
 */
const createFileUploadResponse = (fileName, filePath, fileSize, message = 'File uploaded successfully') => {
  return createSuccessResponse(message, {
    fileName,
    filePath,
    fileSize,
    uploadedAt: new Date().toISOString()
  });
};

/**
 * Create a response for authentication success
 * @param {object} user - User object
 * @param {string} token - JWT access token
 * @param {string} refreshToken - JWT refresh token
 * @param {string} message - Success message
 * @returns {object} Formatted authentication response
 */
const createAuthResponse = (user, token, refreshToken, message = 'Authentication successful') => {
  return createSuccessResponse(message, {
    user,
    tokens: {
      accessToken: token,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  });
};

module.exports = {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  createValidationErrorResponse,
  createFileUploadResponse,
  createAuthResponse,
  asyncHandler
};