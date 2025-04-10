import Boom from '@hapi/boom';

import BaseController from './BaseController.js';

class UsersController extends BaseController {
  /**
   * @param usersService {UsersService}
   * @param validation {Joi.schema}
   */
  constructor(usersService, validation) {
    super(usersService.log);
    this.usersService = usersService;
    this.validation = validation;
  }

  async getAllUsers(request, h) {
    this.log.info('Getting all users');
    try {
      if (!request.hasRoleAccess(request.auth.credentials?.role, 'ADMIN')) {
        this.log.warn(
          `Access denied: User with role ${request.auth.credentials?.role} attempted to access user list`
        );
        const errResponse = new Boom.forbidden(
          'Only admin can have access to this list user'
        );
        errResponse.output.payload = {
          title: 'USERS_FORBIDDEN',
          detail: errResponse.message,
          status: 403,
          code: 'FORBIDDEN'
        };
        throw errResponse;
      }

      const queryParams = request.query;
      const { error, value } =
        this.validation.cursorPaginate.validate(queryParams);

      if (error) {
        this.log.warn(`Validation error in getAllUsers: ${error.message}`);
        return this.baseResponse({
          hapiResponse: h,
          payload: {
            errors: error.details.map((detail) => ({
              title: 'USERS_VALIDATION_ERROR',
              detail: detail.message,
              status: 400,
              code: 'VALIDATION_ERROR'
            }))
          },
          statusCode: 400
        });
      }

      const data = await this.usersService.getAll({
        pagination: value
      });

      this.log.info('Successfully retrieved all users');
      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_GET_ALL_USERS',
          data,
          status: 200,
          code: 'STATUS_OK'
        }
      });
    } catch (err) {
      return this.handleError({
        hapiResponse: h,
        error: err,
        messageInternalServer: `An unexpected error occurred during get all users.\n${err.message}`
      });
    }
  }

  async refreshToken(request, h) {
    this.log.info('Processing Refresh token');
    try {
      // Get the token from cookies
      const refreshToken = request.state.refreshToken;
      if (!refreshToken) {
        return this.baseResponse({
          hapiResponse: h,
          payload: {
            errors: [
              {
                title: 'INVALID_USERS_REFRESH_TOKEN',
                detail: `Missing or invalid token: ${refreshToken}`,
                status: 400,
                code: 'VALIDATION_ERROR'
              }
            ]
          },
          statusCode: 400
        });
      }
      this.log.info('Verify refresh token');
      const data = await this.usersService.refreshToken({ refreshToken });
      this.log.info('Successfully verified refresh token');
      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_USERS_REFRESH_TOKEN',
          data,
          status: 200,
          code: 'STATUS_OK'
        }
      });
    } catch (error) {
      return this.handleError({
        hapiResponse: h,
        error: error,
        messageInternalServer: `An unexpected error occurred during refresh token`
      });
    }
  }

  /**
   * User Registration Controller
   * @param {*} request
   * @param {*} h
   */
  async register(request, h) {
    this.log.info('Processing user registration');
    try {
      // Validate request payload
      const { error, value } = this.validation.register.validate(
        request.payload
      );
      if (error) {
        this.log.warn(`Validation error in register: ${error.message}`);
        return this.baseResponse({
          hapiResponse: h,
          payload: {
            errors: error.details.map((detail) => ({
              title: 'USERS_VALIDATION_ERROR',
              detail: detail.message,
              status: 400,
              code: 'VALIDATION_ERROR'
            }))
          },
          statusCode: 400
        });
      }

      // Register user
      await this.usersService.register(value);

      this.log.info(`User registered successfully: ${value.email}`);
      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_CREATE_USER',
          data: { message: 'User registered successfully' },
          status: 201,
          code: 'STATUS_CREATED'
        }
      });
    } catch (err) {
      this.log.error(`Error in user registration: ${err.message}`);
      return this.handleError({
        hapiResponse: h,
        error: err,
        messageInternalServer: `An unexpected error occurred during user registration.\n${err.message}`
      });
    }
  }

  /**
   * User Login Controller
   * @param {*} request
   * @param {*} h
   */
  async login(request, h) {
    this.log.info('Processing user login');
    try {
      // Validate request payload
      const { error, value } = this.validation.login.validate(request.payload);

      if (error) {
        this.log.warn(`Validation error in login: ${error.message}`);
        return this.baseResponse({
          hapiResponse: h,
          payload: {
            errors: error.details.map((detail) => ({
              title: 'USERS_VALIDATION_ERROR',
              detail: detail.message,
              status: 400,
              code: 'VALIDATION_ERROR'
            }))
          },
          statusCode: 400
        });
      }

      // Perform login
      const tokens = await this.usersService.login({ payload: value });

      this.log.info(`User logged in successfully: ${value.email}`);

      // Create response
      const response = this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_LOGIN_USERS',
          data: {
            accessToken: tokens.accessToken
          },
          status: 200,
          code: 'STATUS_OK'
        }
      });

      // Set refresh token as HTTP-only cookie
      response.state('refreshToken', tokens.refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return response;
    } catch (err) {
      this.log.error(`Error in user login: ${err.message}`);
      return this.handleError({
        hapiResponse: h,
        error: err,
        messageInternalServer: `An unexpected error occurred during user login.\n${err.message}`
      });
    }
  }

  /**
   * User Update Controller
   * @param {*} request
   * @param {*} h
   */
  async update(request, h) {
    this.log.info('Processing user update');
    try {
      // Validate request payload
      const { error, value } = this.validation.update.validate(request.payload);

      if (error) {
        this.log.warn(`Validation error in update: ${error.message}`);
        return this.baseResponse({
          hapiResponse: h,
          payload: {
            errors: error.details.map((detail) => ({
              title: 'USERS_VALIDATION_ERROR',
              detail: detail.message,
              status: 400,
              code: 'VALIDATION_ERROR'
            }))
          },
          statusCode: 400
        });
      }

      // Get current user's email from authentication
      const credential = request.auth.credentials;

      // Update user
      await this.usersService.update({
        email: credential?.email,
        data: value
      });

      this.log.info(`User updated successfully: ${credential?.email}`);
      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_UPDATE_USER',
          data: {
            message: 'User updated successfully'
          },
          status: 200,
          code: 'STATUS_OK'
        }
      });
    } catch (err) {
      this.log.error(`Error in user update: ${err.message}`);
      return this.handleError({
        hapiResponse: h,
        error: err,
        messageInternalServer: `An unexpected error occurred during user update.\n${err.message}`
      });
    }
  }

  /**
   * User Delete Controller (Admin Only)
   * @param {*} request
   * @param {*} h
   */
  async delete(request, h) {
    this.log.info('Processing user deletion');
    try {
      if (!request.hasRoleAccess(request.auth.credentials?.role, 'ADMIN')) {
        this.log.warn(
          `Permission denied: User with role ${request.auth.credentials?.role} attempted to delete a user`
        );
        const errResponse = new Boom.forbidden('Only admin can delete users');
        errResponse.output.payload = {
          errors: [
            {
              title: 'USERS_PERMISSION_DENIED',
              details: errResponse.message,
              status: errResponse.output.statusCode,
              code: 'FORBIDDEN'
            }
          ]
        };
        throw errResponse;
      }

      const { email } = request.params;

      if (email === request.auth.credentials?.email) {
        this.log.warn(`User attempted to delete own account: ${email}`);
        const errResponse = new Boom.badRequest(
          `Cannot delete own account with email ${email}`
        );
        errResponse.output.payload = {
          errors: [
            {
              title: 'USERS_VALIDATION_ERROR',
              detail: `Cannot delete own account with email ${email}`,
              status: 400,
              code: 'VALIDATION_ERROR'
            }
          ]
        };
        throw errResponse;
      }

      // Validate email
      const { error } = this.validation.login.extract('email').validate(email);

      if (error) {
        this.log.warn(`Email validation error in delete: ${error.message}`);
        return this.baseResponse({
          hapiResponse: h,
          payload: {
            errors: error.details.map((detail) => ({
              title: 'USERS_VALIDATION_ERROR',
              detail: detail.message,
              status: 400,
              code: 'VALIDATION_ERROR'
            }))
          },
          statusCode: 400
        });
      }

      // Delete user
      await this.usersService.delete({ email });

      this.log.info(`User deleted successfully: ${email}`);
      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_DELETE_USER',
          data: {
            message: 'User deleted successfully'
          },
          status: 200,
          code: 'STATUS_OK'
        }
      });
    } catch (err) {
      this.log.error(`Error in user deletion: ${err.message}`);
      return this.handleError({
        hapiResponse: h,
        error: err,
        messageInternalServer: `An unexpected error occurred during user deletion.\n${err.message}`
      });
    }
  }
}

export default UsersController;
