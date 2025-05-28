const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Number of salt rounds (default: 12)
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password, saltRounds = 12) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

/**
 * Generate a random token
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} Random token in hex format
 */
const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a hash for any string using crypto
 * @param {string} input - Input string to hash
 * @param {string} algorithm - Hash algorithm (default: 'sha256')
 * @returns {string} Hashed string in hex format
 */
const generateHash = (input, algorithm = 'sha256') => {
  return crypto.createHash(algorithm).update(input).digest('hex');
};

/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 12)
 * @param {boolean} includeSpecial - Include special characters (default: true)
 * @returns {string} Generated password
 */
const generateSecurePassword = (length = 12, includeSpecial = true) => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let charset = lowercase + uppercase + numbers;
  if (includeSpecial) {
    charset += special;
  }
  
  let password = '';
  
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  if (includeSpecial) {
    password += special[Math.floor(Math.random() * special.length)];
  }
  
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Create HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @param {string} algorithm - HMAC algorithm (default: 'sha256')
 * @returns {string} HMAC signature in hex format
 */
const createHMAC = (data, secret, algorithm = 'sha256') => {
  return crypto.createHmac(algorithm, secret).update(data).digest('hex');
};

/**
 * Verify HMAC signature
 * @param {string} data - Original data
 * @param {string} signature - HMAC signature to verify
 * @param {string} secret - Secret key
 * @param {string} algorithm - HMAC algorithm (default: 'sha256')
 * @returns {boolean} True if signature is valid
 */
const verifyHMAC = (data, signature, secret, algorithm = 'sha256') => {
  const expectedSignature = createHMAC(data, secret, algorithm);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

/**
 * Encrypt text using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @param {string} key - Encryption key (must be 32 bytes)
 * @returns {object} Encrypted data with iv and authTag
 */
const encryptText = (text, key) => {
  if (key.length !== 32) {
    throw new Error('Encryption key must be 32 bytes long');
  }
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-gcm', key);
  cipher.setAAD(Buffer.from('additional-auth-data'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

/**
 * Decrypt text using AES-256-GCM
 * @param {object} encryptedData - Object containing encrypted, iv, and authTag
 * @param {string} key - Decryption key (must be 32 bytes)
 * @returns {string} Decrypted text
 */
const decryptText = (encryptedData, key) => {
  if (key.length !== 32) {
    throw new Error('Decryption key must be 32 bytes long');
  }
  
  const { encrypted, iv, authTag } = encryptedData;
  
  const decipher = crypto.createDecipher('aes-256-gcm', key);
  decipher.setAAD(Buffer.from('additional-auth-data'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateRandomToken,
  generateHash,
  generateSecurePassword,
  createHMAC,
  verifyHMAC,
  encryptText,
  decryptText
};