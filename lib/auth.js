import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key-change-in-prod';
const JWT_EXPIRES_IN = '7d';

/**
 * Sign JWT token for the user
 * @param {Object} payload 
 * @returns {String} JWT token
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 * @param {String} token 
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
}

/**
 * Get authenticated user from request cookie
 * @param {Request} req Next.js incoming request
 * @returns {Object|null} User payload or null
 */
export function getAuthUser(req) {
  const tokenCookie = req.cookies.get('token');
  const token = tokenCookie?.value;
  if (!token) return null;
  return verifyToken(token);
}
