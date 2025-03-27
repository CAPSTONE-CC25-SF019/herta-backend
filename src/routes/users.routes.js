import Boom from '@hapi/boom';

import Hash from '../config/hash/bcrypt.js';
import jwe from '../config/jwk/jwe.js';
import jws from '../config/jwk/jws.js';
import Jwe from '../config/jwt/jwe.js';
import Jws from '../config/jwt/jws.js';
import UsersController from '../controller/UsersController.js';
import UsersService from '../service/UsersService.js';
import UsersValidation from '../validation/users.validation.js';

import AuthJwtMiddleware from '../middleware/AuthJwtMiddleware.js';

export default async function (server) {
  // Initialize dependencies
  const usersService = new UsersService(Hash, {
    jwe: new Jwe({ ...jwe, algorithm: 'ECDH-ES+A256KW' }),
    jws: {
      accessToken: new Jws({
        privateKey: jws.accessTokenPrivateKey,
        publicKey: jws.accessTokenPublicKey,
        algorithms: ['EdDSA']
      }),
      refreshToken: new Jws({
        privateKey: jws.refreshTokenPrivateKey,
        publicKey: jws.refreshTokenPublicKey,
        algorithms: ['EdDSA']
      })
    }
  });
  const usersController = new UsersController(usersService, UsersValidation);

  // Create JWE and JWS instances
  const jweInstance = new Jwe({ ...jwe, algorithm: 'ECDH-ES+A256KW' });
  const jwsAccessToken = new Jws({
    privateKey: jws.accessTokenPrivateKey,
    publicKey: jws.accessTokenPublicKey,
    algorithms: ['EdDSA']
  });

  // Create AuthJwtMiddleware instance
  const authMiddleware = new AuthJwtMiddleware({
    name: process.env.JWT_AUTH_NAME,
    jwe: jweInstance, // Pass JWE instance
    jws: jwsAccessToken, // Pass JWS instance
    protectedRoutes: [
      { path: '/api/v1/users/update', method: 'PUT', role: 'user' },
      { path: '/api/v1/users/delete', method: 'DELETE', role: 'admin' }
    ],
    roleHierarchy: { admin: ['editor', 'user'], editor: ['user'] }
  });

  // Register the middleware
  await authMiddleware.register(server);


  server.route([
    {
      method: 'POST',
      path: '/api/v1/users/register',
      options: {
        handler: (request, h) => usersController.register(request, h)
      }
    },
    {
      method: 'POST',
      path: '/api/v1/users/login',
      options: {
        handler: (request, h) => usersController.login(request, h)
      }
    },
    {
      method: 'PUT',
      path: '/api/v1/users/update',
      options: {
        auth: 'jwt',
        handler: (request, h) => usersController.update(request, h)
      }
    },
    {
      method: 'DELETE',
      path: '/api/v1/users/delete',
      options: {
        auth: 'jwt',
        pre: [
          {
            method: (request) => {
              // RBAC Check - Only admin can delete users
              if (!request.hasRoleAccess('ADMIN')) {
                throw Boom.forbidden('Only admin can delete users');
              }
              return true;
            }
          }
        ],
        handler: (request, h) => usersController.delete(request, h)
      }
    }
  ]);
}
