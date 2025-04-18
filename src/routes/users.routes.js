import Hash from '../config/hash/bcrypt.js';
import jwe from '../config/jwk/jwe.js';
import jws from '../config/jwk/jws.js';
import Jwe from '../config/jwt/jwe.js';
import Jws from '../config/jwt/jws.js';
import UsersController from '../controller/UsersController.js';
import AuthJwtMiddleware from '../middleware/AuthJwtMiddleware.js';
import UsersService from '../service/UsersService.js';
import UsersValidation from '../validation/users.validation.js';

export default async function (server) {
  // Create JWE and JWS instances
  const jweInstance = new Jwe({ ...jwe, algorithm: 'ECDH-ES+A256KW' });
  const jwsAccessToken = new Jws({
    privateKey: jws.accessTokenPrivateKey,
    publicKey: jws.accessTokenPublicKey,
    algorithm: 'EdDSA'
  });
  // Initialize dependencies
  const usersService = new UsersService(new Hash(), {
    jwe: jweInstance,
    jws: {
      accessToken: jwsAccessToken,
      refreshToken: new Jws({
        privateKey: jws.refreshTokenPrivateKey,
        publicKey: jws.refreshTokenPublicKey,
        algorithm: 'EdDSA'
      })
    }
  });

  const usersController = new UsersController(usersService, UsersValidation);

  // Create AuthJwtMiddleware instance
  const authMiddleware = new AuthJwtMiddleware({
    payloadTokenSchema: UsersValidation.payloadToken,
    name: process.env.JWT_AUTH_NAME,
    jwe: jweInstance, // Pass JWE instance
    jws: jwsAccessToken, // Pass JWS instance
    protectedRoutes: [
      { path: '/api/v1/users', method: 'PUT' },
      { path: /^\/api\/v1\/users\/.*$/, method: 'DELETE', role: 'admin' },
      { path: /^\/api\/v1\/users(\?.*)?$/, method: 'GET', role: 'admin' }, // list users
      { path: '/api/v1/users/profile', method: 'GET' } // self profile
    ],
    roleHierarchy: { admin: ['user'] }
  });

  // Register the middleware
  await authMiddleware.register(server);

  server.route([
    {
      method: 'GET',
      path: '/api/v1/users',
      options: {
        auth: 'jwt',
        handler: (request, h) => usersController.getAllUsers(request, h)
      }
    },
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
      method: 'GET',
      path: '/api/v1/users/refresh-token',
      options: {
        handler: (request, h) => usersController.refreshToken(request, h)
      }
    },
    {
      method: 'PUT',
      path: '/api/v1/users',
      options: {
        auth: 'jwt',
        handler: (request, h) => usersController.update(request, h)
      }
    },
    {
      method: 'DELETE',
      path: '/api/v1/users/{email}',
      options: {
        auth: 'jwt',
        handler: (request, h) => usersController.delete(request, h)
      }
    }
  ]);
}
