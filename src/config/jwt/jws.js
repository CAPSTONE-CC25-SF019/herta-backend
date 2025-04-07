import { SignJWT, jwtVerify } from 'jose';

/**
 * @define {Jws} - JSON Web Signing
 *
 */
export default class Jws {
  /**
   * Create New Instance Jws
   * @param {{privateKey: CryptoKey, publicKey: CryptoKey, algorithm: string}} options - Configuration options for Json Web Signing.
   */
  constructor(options = {}) {
    try {
      if (!options.privateKey || !options.publicKey)
        throw new Error('Private Key and Public Key is required');
      this.name = process.env.JWT_AUTH_NAME || 'dev-jwt-auth-name';
      this.privateKey = options.privateKey;
      this.publicKey = options.publicKey;
      this.algorithm = options.algorithm;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Generates a JWT token.
   * @async
   * @param {Object} payload - Data to be included in the token.
   * @param {Object} [options] - JWT options (e.g., expiration time).
   * @param {string} [options.expiresIn='5m'] - Token expiration time.
   * @returns {Promise<string>} Generated JWT token.
   */
  async generateToken(payload, options = {}) {
    try {
      const jwt = new SignJWT(payload);
      jwt.setProtectedHeader({ alg: this.algorithm });
      jwt.setIssuedAt();
      jwt.setIssuer(this.name);
      jwt.setExpirationTime(options.expiresIn || '5m');

      const token = await jwt.sign(this.privateKey);
      return token;
    } catch (error) {
      console.error('Error generating token:', error);
      throw error;
    }
  }

  /**
   * Verifies a JWT token.
   * @async
   * @param {string} token - Token to verify.
   * @returns {Promise<Object>} Decoded token payload.
   * @throws {Error} If token is invalid or expired.
   */
  async verifyToken(token) {
    try {
      const result = await jwtVerify(token, this.publicKey, {
        algorithms: [this.algorithm]
      });
      return result;
    } catch (error) {
      console.error('Error verifying token:', error);
      throw error;
    }
  }
}
