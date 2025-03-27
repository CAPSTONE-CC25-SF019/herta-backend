import { SignJWT, jwtVerify } from 'jose';

/**
 * @define {Jws} - JSON Web Signing
 *
 */
export default class Jws {
  /**
   * Create New Instance Jws
   * @param {{privateKey: CryptoKey, publicKey: CryptoKey}} options - Configuration options for Json Web Signing.
   */
  constructor(options = {}) {
    try {
      if (!options.privateKey || !options.publicKey)
        throw new Error('Private Key and Public Key is required');
      this.privateKey = options.privateKey;
      this.publicKey = options.publicKey;
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
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: this.algorithms.jws })
      .setIssuedAt()
      .setIssuer(this.name)
      .setExpirationTime(options.expiresIn || '5m')
      .sign(this.privateKey);
  }

  /**
   * Verifies a JWT token.
   * @async
   * @param {string} token - Token to verify.
   * @returns {Promise<Object>} Decoded token payload.
   * @throws {Error} If token is invalid or expired.
   */
  async verifyToken(token) {
    return await jwtVerify(token, this.publicKey, {
      algorithms: [this.algorithms.jws]
    });
  }
}
