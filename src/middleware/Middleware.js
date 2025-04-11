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
    this.protectedRoutes = [];
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

  /**
   * Function to handle request
   * @param {Hapi.Request} request - Hapi Request object
   * @param {Hapi.h} h - Hapi response toolkit
   * @returns {Hapi.Response} Response object
   */
  // eslint-disable-next-line no-unused-vars
  async handler(request, h) {
    throw new Error('Method handler() must be implemented by subclass');
  }

  /**
   * Check if a route requires
   * @param {string} path - The route path to check
   * @returns {boolean} - Whether the route requires authentication
   */
  routeRequires(path) {
    return this.protectedRoutes.some((route) => {
      // Handle wildcard routes (e.g., '/api/*')
      if (route.endsWith('*')) {
        const prefix = route.slice(0, -1);
        return path.startsWith(prefix);
      }
      return path === route;
    });
  }
}
