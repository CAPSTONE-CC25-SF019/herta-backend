import jwe from '../config/jwk/jwe.js';
import jws from '../config/jwk/jws.js';
import Jwe from '../config/jwt/jwe.js';
import Jws from '../config/jwt/jws.js';
import AuthJwtMiddleware from '../middleware/AuthJwtMiddleware.js';
import UsersValidation from '../validation/users.validation.js';
import diagnosesRoutes from './diagnoses.routes.js';
import diseasesRoutes from './diseases.routes.js';
import symptomsRoutes from './symptoms.routes.js';
import usersRoutes from './users.routes.js';

export default async function (server) {
  try {
    // Create JWE and JWS instances
    const jweInstance = new Jwe({ ...jwe, algorithm: 'ECDH-ES+A256KW' });
    const jwsAccessToken = new Jws({
      privateKey: jws.accessTokenPrivateKey,
      publicKey: jws.accessTokenPublicKey,
      algorithm: 'EdDSA'
    });
    const jwsRefreshToken = new Jws({
      privateKey: jws.refreshTokenPrivateKey,
      publicKey: jws.refreshTokenPublicKey,
      algorithm: 'EdDSA'
    });

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
        {
          path: /^\/api\/v1\/users\/cursor(\?.*)?$/,
          method: 'GET',
          role: 'admin'
        },
        { path: '/api/v1/users/profile', method: 'GET' }, // self profile
        { path: /^\/api\/v1\/diseases\/[^/]+$/, method: 'PUT', role: 'admin' },
        { path: /^\/api\/v1\/symptoms\/[^/]+$/, method: 'PUT', role: 'admin' },
        // Create diagnosis
        { path: '/api/v1/diagnoses', method: 'POST' },

        // Update diagnosis by ID
        { path: /^\/api\/v1\/diagnoses\/[^/]+$/, method: 'PUT' },

        // Delete diagnosis by ID
        { path: /^\/api\/v1\/diagnoses\/[^/]+$/, method: 'DELETE' },

        // Get diagnoses by user ID - Admin only
        {
          path: /^\/api\/v1\/diagnoses\/relationship\/users\/[^/]+$/,
          method: 'GET',
          role: 'admin'
        },

        // Get self diagnoses
        { path: '/api/v1/diagnoses/self/relationship/users', method: 'GET' },

        // Get self diagnoses by disease ID
        {
          path: /^\/api\/v1\/diagnoses\/self\/relationship\/diseases\/[^/]+$/,
          method: 'GET'
        },

        // Get all diagnoses by disease ID - Admin only
        {
          path: /^\/api\/v1\/diagnoses\/relationship\/diseases\/[^/]+$/,
          method: 'GET',
          role: 'admin'
        },

        // Get diagnoses by symptoms - Admin only
        {
          path: /^\/api\/v1\/diagnoses\/relationship\/symptoms(\?.*)?$/,
          method: 'GET',
          role: 'admin'
        },

        // Get all diagnoses with pagination - Admin only
        { path: /^\/api\/v1\/diagnoses(\?.*)?$/, method: 'GET', role: 'admin' },

        // Get self diagnoses by symptoms
        {
          path: /^\/api\/v1\/diagnoses\/self\/relationship\/symptoms(\?.*)?$/,
          method: 'GET'
        },

        // Get diagnosis statistics by user ID - Admin only
        {
          path: /^\/api\/v1\/diagnoses\/relationship\/users\/[^/]+\/statistics$/,
          method: 'GET',
          role: 'admin'
        },

        // Get self diagnosis statistics
        {
          path: '/api/v1/diagnoses/self/relationship/users/statistics',
          method: 'GET'
        }
      ],
      roleHierarchy: { admin: ['user'] }
    });

    // Register the middleware
    await authMiddleware.register(server);
    // attach the route to hapi server
    server.route(
      usersRoutes({
        jwe: jweInstance,
        jws: { accessToken: jwsAccessToken, refreshToken: jwsRefreshToken }
      })
    );
    server.route(diseasesRoutes());
    server.route(symptomsRoutes());
    server.route(diagnosesRoutes());
  } catch (error) {
    console.error(error);
    throw error;
  }
}
