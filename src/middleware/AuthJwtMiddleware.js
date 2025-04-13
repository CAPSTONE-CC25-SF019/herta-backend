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
   * @type {Jws}
   */
  #jws;
  /**
   * Description placeholder
   *
   * @type {Jwe}
   */
  #jwe;

  /**
   * Creates an instance of AuthJwtMiddleware.
   *
   * @param {Object} options - Configuration options for authentication middleware.
   * @param {string} options.name - The name of issuer or mantaining the auth
   * @param {Joi.ObjectSchema} options.payloadTokenSchema - The schema to validate payload
   * @param {Jws} options.jws - Keys used for signing JWT.
   * @param {Jwe} options.jwe - Keys used for encrypting JWT.
   * @param {{path: string, method: string, role: string}[]} [options.protectedRoutes=[]] - List of routes that require authentication.
   * @param {Object} [options.roleHierarchy={}] - Hierarchy of roles for access control (e.g., { admin: ['editor', 'user'], editor: ['user'] }).
   */
  constructor(options = {}) {
    super(Logger.app);
    try {
      this.name = options.name || 'auth-jwt-middleware';
      this.schema = options.payloadTokenSchema;
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
       * @type {winston.Logger}
       */
      this.log = Logger.app;

      this.model = models.User;

      this.log.info('AuthJwtMiddleware initialized', {
        protectedRoutes: this.protectedRoutes
      });
    } catch (error) {
      this.log.error(error);
      throw error;
    }
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
   */
  async register(server) {
    // Register authentication scheme
    server.auth.scheme('jwt-auth', () => {
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

              const customError = this.createCustomError(
                'Missing or invalid authorization token'
              );
              return h.unauthenticated(customError, { credentials: {} });
            }

            this.log.debug('Verifying token and validating payload');
            const token = authorization.split(' ')[1];

            let payloadEncrypted;
            try {
              // Nest the token verification in its own try-catch
              payloadEncrypted = await this.#jws.verifyToken(token);
            } catch (verifyError) {
              this.log.warn(
                `Token verification failed: ${verifyError.message}`
              );
              if (verifyError?.code === 'ERR_JWT_EXPIRED') {
                return h.unauthenticated(
                  this.createCustomError(`Token has been expired`),
                  { credentials: {} }
                );
              }
              const customError = this.createCustomError(
                `Token verification failed: ${verifyError.message}`
              );
              return h.unauthenticated(customError, { credentials: {} });
            }

            let payload;
            try {
              // Nest the decryption in its own try-catch
              payload = await this.#jwe.decryptPayload(
                payloadEncrypted.payload.data
              );
            } catch (decryptError) {
              this.log.warn(`Token decryption failed: ${decryptError.message}`);

              const customError = this.createCustomError(
                `Token decryption failed: ${decryptError.message}`
              );
              return h.unauthenticated(customError, { credentials: {} });
            }
            const { error } = this.schema.validate(payload);
            // Validate token
            if (error) {
              this.log.warn(
                `Invalid token payload for request to ${request.path}`
              );

              const customError = this.createCustomError(
                `Invalid token payload for request to ${request.path}`
              );
              return h.unauthenticated(customError, { credentials: {} });
            }

            let user;
            try {
              user = await this.model.findFirstOrThrow({
                where: {
                  email: payload.email
                },
                select: {
                  id: true,
                  email: true,
                  role: true
                }
              });
            } catch (dbError) {
              this.log.warn(`User not found: ${dbError.message}`);

              const customError = this.createCustomError(
                'User not found or invalid'
              );
              return h.unauthenticated(customError, { credentials: {} });
            }

            // RBAC Check - Verify if user has the required role for this route
            if (authRequirement.requiredRole) {
              if (
                !this.hasRoleAccess(
                  user.role.toLocaleUpperCase(),
                  authRequirement.requiredRole.toLocaleUpperCase()
                )
              ) {
                this.log.warn(
                  `Access denied for user ID: ${user.id} with role ${user.role}. Required role: ${authRequirement.requiredRole}`
                );

                const accessDeniedError = this.createCustomError(
                  `Access denied. Required role: ${authRequirement.requiredRole}`,
                  'Bearer',
                  403,
                  'FORBIDDEN',
                  'ACCESS_DENIED'
                );

                return h.unauthenticated(accessDeniedError, {
                  credentials: {}
                });
              }

              this.log.info(
                `Role-based access granted for user ID: ${user.id} with role: ${user.role}`
              );
            }

            this.log.info(
              `Authentication successful for user ID: ${payload.id}`
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

            // Always include credentials object to avoid AssertError
            const generalError = this.createCustomError(
              `Authentication failed: ${error.message}`
            );
            return h.unauthenticated(generalError, { credentials: {} });
          }
        }
      };
    });

    // Register default auth strategy
    server.auth.strategy('jwt', 'jwt-auth');

    // Register RBAC plugin for role-based authorization
    await server.register({
      plugin: {
        name: 'rbac',
        version: '1.0.0',
        register: async (server, options) => {
          // Register decorations for easy role checking
          server.decorate('toolkit', 'forbidden', function (message) {
            const customError =
              AuthJwtMiddleware.prototype.createCustomError.call(
                this,
                message || 'Forbidden',
                'Bearer',
                403,
                'FORBIDDEN',
                'ACCESS_DENIED'
              );

            return this.response(customError).code(403);
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
          server.decorate(
            'request',
            'hasRoleAccess',
            function (userRole, requiredRole) {
              if (!this.auth.credentials) {
                return false;
              }
              return AuthJwtMiddleware.prototype.hasRoleAccess.call(
                { roleHierarchy: options.roleHierarchy || {} },
                userRole || this.auth.credentials.role,
                requiredRole
              );
            }
          );

          this.log.info('RBAC plugin registered successfully');
        }
      },
      options: {
        roleHierarchy: this.roleHierarchy
      }
    });
  }
}

export default AuthJwtMiddleware;
