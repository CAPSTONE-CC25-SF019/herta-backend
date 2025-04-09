import Boom from '@hapi/boom';

import ErrorService from '../error/ErrorService.js';

export default class BaseController {
  constructor(log) {
    this.log = log;
  }

  /**
   * Base method to create a response with consistent structure
   * @param options {{
   *   hapiResponse: hapi.ResponseToolkit,
   *   payload: Object,
   *   statusCode: number
   * }}
   */
  baseResponse(options) {
    const { hapiResponse, payload, statusCode } = options;
    this.log?.info(`Sending response with status code: ${statusCode}`);
    return hapiResponse.response(payload).code(statusCode);
  }

  /**
   * Create successful response with consistent structure
   * @param options {{
   *   hapiResponse: hapi.ResponseToolkit,
   *   response: {
   *     title: string,
   *     data: any,
   *     status: number,
   *     code: string
   *   }
   * }}
   */
  createResponse(options) {
    const { hapiResponse, response } = options;
    this.log?.info(`Creating successful response: ${response.title}`);
    return this.baseResponse({
      hapiResponse,
      payload: response,
      statusCode: response.status || 200
    });
  }

  /**
   * Handle errors with consistent response structure
   * @param options {{
   *   hapiResponse: hapi.ResponseToolkit,
   *   error: Error,
   *   messageInternalServer: string
   * }}
   */
  handleError(options) {
    const { hapiResponse, error, messageInternalServer } = options;

    // Handle error from instance ErrorService
    if (error instanceof ErrorService) {
      this.log?.error(`ErrorService error: ${error.message}`);
      return this.baseResponse({
        hapiResponse,
        payload: {
          errors: [
            {
              title: error?.title,
              detail: error.message,
              status: error.status,
              code: error.code
            }
          ]
        },
        statusCode: error.status
      });
    }

    // Handle Boom errors
    if (Boom.isBoom(error)) {
      this.log?.error(`Boom error: ${error.message}`);
      return error;
    }

    // Handle generic errors as internal server errors
    this.log?.error(
      `Internal server error: ${messageInternalServer || error.message}`
    );
    return this.baseResponse({
      hapiResponse,
      payload: {
        errors: [
          {
            title: 'INTERNAL_SERVER_ERROR',
            detail: messageInternalServer || 'An unexpected error occurred',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR'
          }
        ]
      },
      statusCode: 500
    });
  }
}
