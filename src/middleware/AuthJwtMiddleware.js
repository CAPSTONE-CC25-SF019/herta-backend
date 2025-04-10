import Middleware from './Middleware.js';

/**
 * Authentication middleware using JWT for Hapi.js
 *
 * This middleware handles authentication using JSON Web Tokens (JWT),
 * supports signing (JWS) and encryption (JWE), and integrates with
 * Hapi's authentication system.
 */
class AuthJwtMiddleware extends Middleware {
  #jws;
  #jwe;

  /**
   * Creates an instance of AuthJwtMiddleware.
   *
   * @param {Object} options - Configuration options for authentication middleware.
   * @param {{privateKey: CryptoKey, publicKey: CryptoKey}} options.jws - Keys used for signing JWT.
   * @param {{privateKey: CryptoKey, publicKey: CryptoKey}} options.jwe - Keys used for encrypting JWT.
   * @param {string} [options.algorithm='EdDSA'] - Algorithm used for signing and verifying tokens.
   * @param {string[]} [options.protectedRoutes=[]] - List of routes that require authentication.
   */
  constructor(options = {}) {
    try {
      super();
      this.name = 'auth-jwt-middleware';
      this.algorithm = options.algorithm || 'EdDSA';
      this.protectedRoutes = options.protectedRoutes || [];
      this.#jws = options.jws;
      this.#jwe = options.jwe;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registers the JWT authentication middleware in a Hapi server.
   *
   * @param {import('@hapi/hapi').Server} server - The Hapi server instance.
   * @param {Object} options - Middleware options.
   * @param {boolean} [options.setAsDefault=false] - If true, sets JWT authentication as the default.
   */
  register(server, options) {
    // Register authentication scheme
    server.auth.scheme('jwt', (server, schemeOptions) => {
      return {
        authenticate: async (request, h) => {
          // Check if the current route requires authentication
          const requiresAuth = this.routeRequires(request.path);

          if (!requiresAuth) {
            return h.continue;
          }

          try {
            // Get token from Authorization header
            const authorization = request.headers.authorization;
            if (!authorization || !authorization.startsWith('Bearer ')) {
              return h.unauthenticated(
                new Error('Missing or invalid authorization token')
              );
            }

            const token = authorization.split(' ')[1];
            const decoded = jwt.verify(token, this.secretKey, {
              algorithms: [this.algorithm]
            });

            // Validate token
            if (!decoded || !decoded.userId) {
              return h.unauthenticated(new Error('Invalid token payload'));
            }

            // Set credentials that will be available in request.auth.credentials
            return h.authenticated({
              credentials: {
                userId: decoded.userId,
                scope: decoded.scope || [],
                ...decoded
              }
            });
          } catch (error) {
            return h.unauthenticated(
              new Error(`Authentication failed: ${error.message}`)
            );
          }
        }
      };
    });

    // Register default auth strategy
    server.auth.strategy('jwt', 'jwt');

    // Option to enable auth by default on all routes
    if (options.setAsDefault) {
      server.auth.default('jwt');
    }
  }

  /**
   * Generates a JWT token.
   *
   * @param {Object} payload - Data to be included in the token.
   * @param {Object} [options] - JWT options (e.g., expiration time).
   * @param {string} [options.expiresIn='1h'] - Token expiration time.
   * @returns {string} Generated JWT token.
   */
  generateToken(payload, options = {}) {
    return jwt.sign(payload, this.secretKey, {
      algorithm: this.algorithm,
      expiresIn: options.expiresIn || '1h',
      ...options
    });
  }

  /**
   * Verifies a JWT token.
   *
   * @param {string} token - Token to verify.
   * @returns {Object} Decoded token payload.
   * @throws {Error} If token is invalid or expired.
   */
  verifyToken(token) {
    return jwt.verify(token, this.secretKey, { algorithms: [this.algorithm] });
  }
}

export default AuthJwtMiddleware;
