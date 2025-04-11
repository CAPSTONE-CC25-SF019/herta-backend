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
   * @param {{
   *   title: string,
   *   message: string,
   *   status: number,
   *   code: string
   * }} errorObject
   */
  constructor(errorObject) {
    super(errorObject?.message);
    this.name = 'ErrorService';
    this.title = errorObject?.title;
    this.status = errorObject?.status;
    this.code = errorObject?.code;
  }

  /**
   * Create a not found error
   * @param {{
   *   entityName: string,
   *   fieldName: string,
   *   fieldValue: any,
   * }} errorObject
   * @returns {ErrorService}
   */
  static notFound(errorObject) {
    return new ErrorService({
      title: `${errorObject.entityName.toUpperCase()}_NOT_FOUND`,
      message: `${errorObject.entityName} field ${errorObject.fieldName} not found with value ${errorObject.fieldValue}`,
      status: 404,
      code: 'NOT_FOUND'
    });
  }

  /**
   * Create a conflict error
   * @param {{
   *   entityName: string,
   *   fieldName: string,
   *   fieldValue: any
   * }} errorObject - error object
   * @param {string} entity - Entity name
   * @param {string} field - Field that caused the conflict
   * @param {string|number} value - Value that caused the conflict
   * @returns {ErrorService}
   */
  static conflict(errorObject) {
    return new ErrorService({
      title: `${errorObject.entityName.toUpperCase()}_CONFLICT`,
      message: `${errorObject.entityName} have conflicts in ${errorObject?.fieldName} ${errorObject.fieldValue ? 'with value' + errorObject.fieldValue : ''}`,
      status: 409,
      code: 'CONFLICT'
    });
  }

  /**
   * Create a validation error
   * @param {{
   *   entityName: string,
   *   message: string
   * }} errorObject
   * @param {string} message - Validation error message
   * @returns {ErrorService}
   */
  static validation(errorObject) {
    return new ErrorService({
      title: `${errorObject.entityName.toUpperCase()}_VALIDATION_ERROR`,
      message: errorObject.message,
      status: 400,
      code: 'VALIDATION_ERROR'
    });
  }

  /**
   * Create a server error
   * @param {string} message - Error message
   * @returns {ErrorService}
   */
  static server(message) {
    return new ErrorService({
      title: 'INTERNAL_SERVER_ERROR',
      message: `${message}`,
      status: 500,
      code: 'INTERNAL_SERVER_ERROR'
    });
  }

  /**
   * Create an unauthorized error
   * @param {{
   *   entityName: string,
   *   message: string
   * }} errorObject
   * @returns {ErrorService}
   */
  static unauthorized(errorObject) {
    return new ErrorService({
      title: `${errorObject.entityName.toUpperCase()}_UNAUTHORIZED`,
      message: errorObject.message,
      status: 401,
      code: 'UNAUTHORIZED'
    });
  }

  /**
   * Create a forbidden error
   * @param {{
   *   entityName: string,
   *   message: string
   * }} errorObject
   * @returns {ErrorService}
   */
  static forbidden(errorObject) {
    return new ErrorService({
      title: `${errorObject.entityName.toUpperCase()}_FORBIDDEN`,
      message: errorObject.message,
      status: 403,
      code: 'FORBIDDEN'
    });
  }
}
