class UsersController {
  constructor(usersService, validation) {
    this.usersService = usersService;
    this.validation = validation;
  }

  /**
   * User Registration Controller
   * @param {*} request
   * @param {*} h
   */
  async register(request, h) {
    try {
      // Validate request payload
      const { error, value } = this.validation.register.validate(
        request.payload
      );

      if (error) {
        return h
          .response({
            errors: [
              {
                title: 'Validation Error',
                detail: error.details[0].message,
                status: 400,
                code: 'VALIDATION_ERROR'
              }
            ]
          })
          .code(400);
      }

      // Register user
      await this.usersService.register(value);

      return h
        .response({
          data: { message: 'User registered successfully' },
          status: 201,
          code: 'CREATED'
        })
        .code(201);
    } catch (err) {
      // Handle service layer errors
      if (err.status && err.code) {
        return h
          .response({
            errors: [
              {
                title: err.name || 'Error',
                detail: err.message,
                status: err.status,
                code: err.code
              }
            ]
          })
          .code(err.status);
      }

      // Generic server error
      return h
        .response({
          errors: [
            {
              title: 'Server Error',
              detail: 'An unexpected error occurred during registration',
              status: 500,
              code: 'INTERNAL_SERVER_ERROR'
            }
          ]
        })
        .code(500);
    }
  }

  /**
   * User Login Controller
   * @param {*} request
   * @param {*} h
   */
  async login(request, h) {
    try {
      // Validate request payload
      const { error, value } = this.validation.login.validate(request.payload);

      if (error) {
        return h
          .response({
            errors: [
              {
                title: 'Validation Error',
                detail: error.details[0].message,
                status: 400,
                code: 'VALIDATION_ERROR'
              }
            ]
          })
          .code(400);
      }

      // Perform login
      const tokens = await this.usersService.login({ payload: value });

      // Set refresh token as HTTP-only cookie
      const response = h
        .response({
          data: {
            accessToken: tokens.accessToken
          },
          status: 200,
          code: 'OK'
        })
        .code(200);

      response.state('refreshToken', tokens.refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return response;
    } catch (err) {
      // Handle service layer errors
      if (err.status && err.code) {
        return h
          .response({
            errors: [
              {
                title: err.name || 'Error',
                detail: err.message,
                status: err.status,
                code: err.code
              }
            ]
          })
          .code(err.status);
      }

      // Generic server error
      return h
        .response({
          errors: [
            {
              title: 'Server Error',
              detail: 'An unexpected error occurred during login',
              status: 500,
              code: 'INTERNAL_SERVER_ERROR'
            }
          ]
        })
        .code(500);
    }
  }

  /**
   * User Update Controller
   * @param {*} request
   * @param {*} h
   */
  async update(request, h) {
    try {
      // Validate request payload
      const { error, value } = this.validation.update.validate(request.payload);

      if (error) {
        return h
          .response({
            errors: [
              {
                title: 'Validation Error',
                detail: error.details[0].message,
                status: 400,
                code: 'VALIDATION_ERROR'
              }
            ]
          })
          .code(400);
      }

      // Get current user's email from authentication
      const userEmail = request.auth.credentials.email;

      // Update user
      await this.usersService.update({
        email: userEmail,
        data: value
      });

      return h
        .response({
          data: { message: 'User updated successfully' },
          status: 200,
          code: 'OK'
        })
        .code(200);
    } catch (err) {
      // Handle service layer errors
      if (err.status && err.code) {
        return h
          .response({
            errors: [
              {
                title: err.name || 'Error',
                detail: err.message,
                status: err.status,
                code: err.code
              }
            ]
          })
          .code(err.status);
      }

      // Generic server error
      return h
        .response({
          errors: [
            {
              title: 'Server Error',
              detail: 'An unexpected error occurred during update',
              status: 500,
              code: 'INTERNAL_SERVER_ERROR'
            }
          ]
        })
        .code(500);
    }
  }

  /**
   * User Delete Controller (Admin Only)
   * @param {*} request
   * @param {*} h
   */
  async delete(request, h) {
    try {
      const { email } = request.payload;

      // Validate email
      const { error } = this.validation.login.extract('email').validate(email);

      if (error) {
        return h
          .response({
            errors: [
              {
                title: 'Validation Error',
                detail: error.details[0].message,
                status: 400,
                code: 'VALIDATION_ERROR'
              }
            ]
          })
          .code(400);
      }

      // Delete user
      await this.usersService.delete({ email });

      return h
        .response({
          data: { message: 'User deleted successfully' },
          status: 200,
          code: 'OK'
        })
        .code(200);
    } catch (err) {
      // Handle service layer errors
      if (err.status && err.code) {
        return h
          .response({
            errors: [
              {
                title: err.name || 'Error',
                detail: err.message,
                status: err.status,
                code: err.code
              }
            ]
          })
          .code(err.status);
      }

      // Generic server error
      return h
        .response({
          errors: [
            {
              title: 'Server Error',
              detail: 'An unexpected error occurred during deletion',
              status: 500,
              code: 'INTERNAL_SERVER_ERROR'
            }
          ]
        })
        .code(500);
    }
  }
}

export default UsersController;
