import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CompactEncrypt, SignJWT, compactDecrypt, jwtVerify } from 'jose';
// Import winston types without conflicting with the Logger variable
// eslint-disable-next-line no-unused-vars
import winston from 'winston';

import Logger from '../config/log/winston.js';
import models from '../model/models.js';
import Middleware from './Middleware.js';

/**
 * Authentication middleware using JWT for Hapi.js
 *
 * This middleware handles authentication using JSON Web Tokens (JWT),
 * supports signing (JWS) and encryption (JWE), and integrates with
 * Hapi's authentication system.
 */
class AuthJwtMiddleware extends Middleware {
  /**
   * Description placeholder
   *
   * @type {{ privateKey: CryptoKey; publicKey: CryptoKey; }}
   */
  #jws;
  /**
   * Description placeholder
   *
   * @type {{ privateKey: CryptoKey; publicKey: CryptoKey; }}
   */
  #jwe;

  /**
   * Creates an instance of AuthJwtMiddleware.
   *
   * @param {Object} options - Configuration options for authentication middleware.
   * @param {string} options.name - The name of issuer or mantaining the auth
   * @param {{privateKey: CryptoKey, publicKey: CryptoKey}} options.jws - Keys used for signing JWT.
   * @param {{privateKey: CryptoKey, publicKey: CryptoKey}} options.jwe - Keys used for encrypting JWT.
   * @param {{ jws: string, jwe: string }} options.algorithms - Algorithm used for signing, verifying tokens (JWS) and (JWE) encryption, decryption payload.
   * @param {{path: string, method: string, role: string}[]} [options.protectedRoutes=[]] - List of routes that require authentication.
   * @param {Object} [options.roleHierarchy={}] - Hierarchy of roles for access control (e.g., { admin: ['editor', 'user'], editor: ['user'] }).
   */
  constructor(options = {}) {
    try {
      super();
      this.name = options.name || 'auth-jwt-middleware';
      this.algorithms = options.algorithms || {
        jws: 'EdDSA',
        jwe: 'ECDH-ES+A256KW'
      };
      this.protectedRoutes = options.protectedRoutes || [];
      this.#jws = options.jws;
      this.#jwe = options.jwe;

      // Role hierarchy for RBAC
      this.roleHierarchy = options.roleHierarchy || {
        admin: ['editor', 'user'],
        editor: ['user'],
        user: []
      };

      /**
       * @type {TextEncoder}
       */
      this.encoder = new TextEncoder();

      /**
       * @type {TextDecoder}
       */
      this.decoder = new TextDecoder();

      /**
       * @type {winston.Logger}
       */
      this.log = Logger.app;

      this.model = models.User;

      this.log.info('AuthJwtMiddleware initialized', {
        protectedRoutes: this.protectedRoutes
      });
    } catch (error) {
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
      .sign(this.#jws.privateKey);
  }

  /**
   * Verifies a JWT token.
   * @async
   * @param {string} token - Token to verify.
   * @returns {Promise<Object>} Decoded token payload.
   * @throws {Error} If token is invalid or expired.
   */
  async verifyToken(token) {
    return await jwtVerify(token, this.#jws.publicKey, {
      algorithms: [this.algorithms.jws]
    });
  }

  /**
   * Encrypt the payload include sensitive data
   *
   * @async
   * @param {Object} payload
   * @returns {Promise<string>}
   */
  async encryptPayload(payload) {
    return await new CompactEncrypt(
      this.encoder.encode(JSON.stringify(payload))
    )
      .setProtectedHeader({ alg: this.algorithms.jwe, enc: 'A256GCM' })
      .encrypt(this.#jwe.publicKey);
  }

  /**
   * Description placeholder
   *
   * @async
   * @param {string} encryptedPayload
   * @returns {Promise<Object>}
   * @throws {Error} - Error if the encryptedPayload invalid format
   */
  async decryptPayload(encryptedPayload) {
    return JSON.parse(
      this.decoder.decode(
        (await compactDecrypt(encryptedPayload, this.#jwe.privateKey)).plaintext
      )
    );
  }

  /**
   * Checks if a user with a specific role has access to a protected route.
   *
   * @param {string} userRole - The role of the user.
   * @param {string} requiredRole - The role required for the route.
   * @returns {boolean} - True if the user has access, false otherwise.
   */
  hasRoleAccess(userRole, requiredRole) {
    if (userRole === requiredRole) {
      return true;
    }

    // Check if the user's role is higher in the hierarchy
    if (this.roleHierarchy[userRole]) {
      const inheritedRoles = this._getAllInheritedRoles(userRole);
      return inheritedRoles.includes(requiredRole);
    }

    return false;
  }

  /**
   * Gets all roles that a user inherits based on the role hierarchy.
   *
   * @param {string} role - The role to check.
   * @returns {string[]} - Array of all roles the user inherits.
   * @private
   */
  _getAllInheritedRoles(role) {
    const inheritedRoles = [];
    const directInheritedRoles = this.roleHierarchy[role] || [];

    // Add directly inherited roles
    inheritedRoles.push(...directInheritedRoles);

    // Recursively add roles inherited from each direct inherited role
    for (const inheritedRole of directInheritedRoles) {
      inheritedRoles.push(...this._getAllInheritedRoles(inheritedRole));
    }

    // Remove duplicates
    return [...new Set(inheritedRoles)];
  }

  /**
   * Checks if the route requires authentication and returns required role if any.
   *
   * @param {string} path - The request path.
   * @param {string} method - The HTTP method used.
   * @returns {Object|null} - Object with isProtected and requiredRole properties or null if not protected.
   */
  routeRequiresAuth(path, method) {
    const matchingRoute = this.protectedRoutes.find((route) => {
      // Check if the route path matches (supports exact match or regex pattern)
      const pathMatches =
        route.path instanceof RegExp
          ? route.path.test(path)
          : route.path === path;

      // Check if method matches (if defined)
      const methodMatches =
        !route.method || route.method.toUpperCase() === method.toUpperCase();

      return pathMatches && methodMatches;
    });

    if (!matchingRoute) {
      return { isProtected: false };
    }

    return {
      isProtected: true,
      requiredRole: matchingRoute.role || null
    };
  }

  /**
   * Registers the JWT authentication middleware in a Hapi server.
   *
   * @param {import('@hapi/hapi').Server} server - The Hapi server instance.
   * @param {Object} options - Middleware options.
   * @param {boolean} [options.setAsDefault=false] - If true, sets JWT authentication as the default.
   */
  async register(server, options) {
    // Register authentication scheme
    server.auth.scheme('authentication', (server, schemeOptions) => {
      return {
        authenticate: async (request, h) => {
          // Check if the current route requires authentication
          const authRequirement = this.routeRequiresAuth(
            request.path,
            request.method
          );

          if (!authRequirement.isProtected) {
            return h.continue;
          }

          this.log.info(
            `Starting authentication for request to path: ${request.path}`
          );

          try {
            // Get token from Authorization header
            this.log.debug('Attempting to get token from Authorization header');
            const authorization = request.headers.authorization;
            if (!authorization || !authorization.startsWith('Bearer ')) {
              this.log.warn(
                `Missing or invalid authorization token for request to ${request.path}`
              );
              return h.unauthenticated(
                new Error('Missing or invalid authorization token')
              );
            }

            this.log.debug('Verifying token and validating payload');
            const token = authorization.split(' ')[1];
            const { payload } = await this.verifyToken(token);

            // Validate token
            if (!payload || !payload?.userId) {
              this.log.warn(
                `Invalid token payload for request to ${request.path}`
              );
              return h.unauthenticated(new Error('Invalid token payload'));
            }

            const user = await this.model.findFirstOrThrow({
              where: {
                id: payload?.userId
              },
              select: {
                id: true,
                email: true,
                role: true
              }
            });

            // RBAC Check - Verify if user has the required role for this route
            if (authRequirement.requiredRole) {
              if (
                !this.hasRoleAccess(user.role, authRequirement.requiredRole)
              ) {
                this.log.warn(
                  `Access denied for user ID: ${user.id} with role ${user.role}. Required role: ${authRequirement.requiredRole}`
                );
                return h.unauthorized(
                  new Error(
                    `Access denied. Required role: ${authRequirement.requiredRole}`
                  )
                );
              }

              this.log.info(
                `Role-based access granted for user ID: ${user.id} with role: ${user.role}`
              );
            }

            this.log.info(
              `Authentication successful for user ID: ${payload.userId}`
            );

            // Set credentials that will be available in request.auth.credentials
            return h.authenticated({
              credentials: {
                ...user
              }
            });
          } catch (error) {
            this.log.error(`Authentication failed: ${error.message}`, {
              path: request.path,
              error: error.stack
            });

            return h.unauthenticated(
              new Error(`Authentication failed: ${error.message}`),
              { statusCode: 401, message: error?.message }
            );
          }
        }
      };
    });

    // Register RBAC plugin for role-based authorization
    await server.register({
      plugin: {
        name: 'rbac',
        version: '1.0.0',
        register: async (server, options) => {
          // Register decorations for easy role checking
          server.decorate('toolkit', 'forbidden', function (message) {
            return this.response()
              .code(403)
              .message(message || 'Forbidden');
          });

          server.decorate('request', 'hasRole', function (role) {
            if (!this.auth.credentials) {
              return false;
            }
            return this.auth.credentials.role === role;
          });

          server.decorate('request', 'hasAnyRole', function (roles) {
            if (!this.auth.credentials || !Array.isArray(roles)) {
              return false;
            }
            return roles.includes(this.auth.credentials.role);
          });

          // Utility method to check if user has access based on role hierarchy
          server.decorate('request', 'hasRoleAccess', function (requiredRole) {
            if (!this.auth.credentials) {
              return false;
            }
            return AuthJwtMiddleware.prototype.hasRoleAccess.call(
              { roleHierarchy: options.roleHierarchy || {} },
              this.auth.credentials.role,
              requiredRole
            );
          });

          this.log.info('RBAC plugin registered successfully');
        }
      },
      options: {
        roleHierarchy: this.roleHierarchy
      }
    });

    // Register default auth strategy
    server.auth.strategy('authentication', 'authentication');

    // Option to enable auth by default on all routes
    if (options.setAsDefault) {
      this.log.info('Setting JWT authentication as default for all routes');
      server.auth.default('authentication');
    }
  }
}

export default AuthJwtMiddleware;
