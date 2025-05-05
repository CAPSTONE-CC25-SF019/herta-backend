import Hash from '../config/hash/bcrypt.js';
import UsersController from '../controller/UsersController.js';
import UsersService from '../service/UsersService.js';
import generateBadRequestResponse from '../utils/generateBadRequestResponse.js';
import UsersValidation from '../validation/users.validation.js';
import swaggerPlugins from '../utils/swaggerPlugins.js';
import ResponseValidation from '../validation/response.validation.js';

/**
 * Registers user-related API routes.
 *
 * @param {Object} param0
 * @param {Object} param0.jwe - JWE instance
 * @param {Object} param0.jws - JWS instance (accessToken, refreshToken)
 * @returns {Array<Object>} List of Hapi.js route configurations
 */
export default function ({ jwe, jws }) {
  const usersService = new UsersService(new Hash(), { jwe, jws });
  const usersController = new UsersController(usersService);

  const failAction = (request, h, err) => {
    return generateBadRequestResponse(h, err, 'USERS_VALIDATION_ERROR');
  };

  return [
    {
      method: 'GET',
      path: '/api/v1/users/profile',
      options: {
        auth: 'jwt',
        description: 'Get authenticated user profile',
        notes: 'Returns the profile of the currently authenticated user.',
        tags: ['api', 'users'],
        response: {
          ...ResponseValidation
        },
        plugins: {
          ...swaggerPlugins
        },
        handler: (request, h) => usersController.getDetail(request, h)
      }
    },
    {
      method: 'GET',
      path: '/api/v1/users/cursor',
      options: {
        auth: 'jwt',
        description: 'Get users with cursor pagination',
        notes: 'Returns a list of users using cursor-based (infinite scroll style) pagination.',
        tags: ['api', 'users'],
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        validate: {
          query: UsersValidation.cursorPaginate,
          failAction
        },
        handler: (request, h) =>
          usersController.getAllByCursorPagination(request, h)
      }
    },
    {
      method: 'GET',
      path: '/api/v1/users',
      options: {
        auth: 'jwt',
        description: 'Get users with traditional pagination',
        notes: 'Returns a list of users using limit-offset pagination.',
        tags: ['api', 'users'],
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        validate: {
          query: UsersValidation.pagination,
          failAction
        },
        handler: (request, h) => usersController.getAllByPagination(request, h)
      }
    },
    {
      method: 'POST',
      path: '/api/v1/users/register',
      options: {
        description: 'Register new user',
        notes: 'Registers a new user account.',
        tags: ['api', 'users', 'auth'],
        response: {
          ...ResponseValidation
        },
        validate: {
          payload: UsersValidation.register,
          failAction
        },
        handler: (request, h) => usersController.register(request, h)
      }
    },
    {
      method: 'POST',
      path: '/api/v1/users/login',
      options: {
        description: 'User login',
        notes: 'Authenticates user and returns JWT tokens.',
        tags: ['api', 'users', 'auth'],
        response: {
          ...ResponseValidation
        },
        validate: {
          payload: UsersValidation.login,
          failAction
        },
        handler: (request, h) => usersController.login(request, h)
      }
    },
    {
      method: 'GET',
      path: '/api/v1/users/refresh-token',
      options: {
        description: 'Refresh JWT token',
        notes: 'Returns a new access token using a valid refresh token.',
        tags: ['api', 'users', 'auth'],
        response: {
          ...ResponseValidation
        },
        handler: (request, h) => usersController.refreshToken(request, h)
      }
    },
    {
      method: 'PUT',
      path: '/api/v1/users',
      options: {
        auth: 'jwt',
        description: 'Update user profile',
        notes: 'Updates the profile information of the authenticated user.',
        tags: ['api', 'users'],
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        validate: {
          payload: UsersValidation.update,
          failAction
        },
        handler: (request, h) => usersController.update(request, h)
      }
    },
    {
      method: 'DELETE',
      path: '/api/v1/users/{email}',
      options: {
        auth: 'jwt',
        description: 'Delete user by email',
        notes: 'Deletes a user by their email address.',
        tags: ['api', 'users'],
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        validate: {
          params: UsersValidation.filterByEmail,
          failAction
        },
        handler: (request, h) => usersController.delete(request, h)
      }
    }
  ];
}
