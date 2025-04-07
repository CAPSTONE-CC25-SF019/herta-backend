// eslint-disable-next-line no-unused-vars
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
  constructor() {
    this.name = '';
    this.version = '1.0.0';
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
