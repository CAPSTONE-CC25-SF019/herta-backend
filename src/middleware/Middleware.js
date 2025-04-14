// eslint-disable-next-line no-unused-vars
import Boom from '@hapi/boom';
import Hapi from '@hapi/hapi';

/**
 * Middleware Abstract Class
 *
 * @export
 * @class Middleware
 * @typedef {Middleware}
 */
export default class Middleware {
  /**
   * Creates an instance of Middleware.
   *
   * @constructor
   */
  constructor(log) {
    this.name = '';
    this.version = '1.0.0';
    this.log = log;
  }

  /**
   * Create base response structure for consistency
   *
   * @param {Object} options - Configuration options for the response
   * @param {string} options.title - Response title
   * @param {string} options.detail - Detailed message
   * @param {number} options.status - HTTP status code
   * @param {string} options.code - Response code
   * @returns {Object} Standardized response object
   */
  createBaseResponse(options) {
    this.log.debug(
      `Creating base response: ${options.title} - ${options.detail}`
    );
    return {
      title: options.title,
      detail: options.detail,
      status: options.status,
      code: options.code
    };
  }

  /**
   * Creates an error response
   *
   * @param {Object} options - Error response options
   * @param {string} options.message - Error message
   * @param {string} [options.title='USERS_UNAUTHORIZED'] - Error title
   * @param {number} [options.status=401] - HTTP status code
   * @param {string} [options.code='UNAUTHORIZED'] - Error code
   * @returns {Object} Error response object
   */
  createErrorResponse(options) {
    this.log.debug(
      `Creating error response: ${options.title || 'USERS_UNAUTHORIZED'} - ${options.message}`
    );
    return {
      errors: [
        this.createBaseResponse({
          title: options.title || 'USERS_UNAUTHORIZED',
          detail: options.message,
          status: options.status || 401,
          code: options.code || 'UNAUTHORIZED'
        })
      ]
    };
  }

  /**
   * Creates a standardized custom error using Boom
   *
   * @param {string} message - Error message
   * @param {string} [scheme='Bearer'] - Authentication scheme (e.g., 'Bearer')
   * @param {number} [status=401] - HTTP status code
   * @param {string} [code='UNAUTHORIZED'] - Error code
   * @param {string} [title='USERS_UNAUTHORIZED'] - Error title
   * @returns {Boom.Boom} Boom error object with custom payload
   */
  createCustomError(
    message,
    scheme = 'Bearer',
    status = 401,
    code = 'UNAUTHORIZED',
    title = 'USERS_UNAUTHORIZED'
  ) {
    this.log.debug(`Creating custom Boom error: ${title} - ${message}`);
    const customError = Boom.unauthorized(message, scheme);

    // Add custom data to the error using our standardized structure
    customError.output.payload = this.createErrorResponse({
      message,
      title,
      status,
      code
    });

    return customError;
  }

  /**
   * Register middleware to Hapi server
   * @param {Hapi.Server} server - Hapi server instance
   * @param {Object} options - Configuration options for the middleware
   */
  // eslint-disable-next-line no-unused-vars
  register(server, options) {
    throw new Error('Method register() must be implemented by subclass');
  }
}
