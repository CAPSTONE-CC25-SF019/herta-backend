/**
 * Custom error class for service layer
 * @extends {Error}
 */
export default class ErrorService extends Error {
  /**
   * HTTP status code
   * @type {number}
   */
  status;

  /**
   * Error code
   * @type {string}
   */
  code;

  /**
   * @param {string} message - Error message
   * @param {number} status - HTTP status code
   * @param {string} code - Error code description
   */
  constructor(message, status, code) {
    super(message);
    this.name = 'ErrorService';
    this.status = status;
    this.code = code;
  }

  /**
   * Create a not found error
   * @param {string} entity - Entity name that was not found
   * @param {string|number} id - Entity ID that was not found
   * @returns {ErrorService}
   */
  static notFound(entity, id) {
    return new ErrorService(
      `${entity} with id ${id} not found`,
      404,
      'NOT_FOUND'
    );
  }

  /**
   * Create a conflict error
   * @param {string} entity - Entity name
   * @param {string} field - Field that caused the conflict
   * @param {string|number} value - Value that caused the conflict
   * @returns {ErrorService}
   */
  static conflict(entity, field, value) {
    return new ErrorService(
      `${entity} with ${field} ${value} already exists`,
      409,
      'CONFLICT'
    );
  }

  /**
   * Create a validation error
   * @param {string} message - Validation error message
   * @returns {ErrorService}
   */
  static validation(message) {
    return new ErrorService(message, 400, 'VALIDATION_ERROR');
  }

  /**
   * Create a server error
   * @param {string} message - Error message
   * @returns {ErrorService}
   */
  static server(message) {
    return new ErrorService(
      message || 'Internal server error',
      500,
      'SERVER_ERROR'
    );
  }

  /**
   * Create an unauthorized error
   * @param {string} message - Error message
   * @returns {ErrorService}
   */
  static unauthorized(message) {
    return new ErrorService(message || 'Unauthorized', 401, 'UNAUTHORIZED');
  }

  /**
   * Create a forbidden error
   * @param {string} message - Error message
   * @returns {ErrorService}
   */
  static forbidden(message) {
    return new ErrorService(message || 'Forbidden', 403, 'FORBIDDEN');
  }
}
