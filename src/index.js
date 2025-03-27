import Hapi from '@hapi/hapi';
import Joi from 'joi';
import process from 'node:process';

import UsersRoutes from './routes/users.routes.js';

/**
 * Function init for initialize api
 * @param {String} host  the host location api
 * @param {Number} port for number port running api
 * @returns {Promise<void>}
 */
const init = async (host, port) => {
  try {
    const server = Hapi.server({
      host,
      port,
      routes: {
        cors: {
          origin: ['*']
        }
      }
    });
    await UsersRoutes(server);
    server.validator(Joi);
    await server.start();
    console.log(`Server running on ${server.info.uri}`);
  } catch (error) {
    console.error(`Error initialization server ${error.message}`);
  }
};

init(process.env.HOST || 'localhost', process.env.PORT || 5000);

process.on('unhandledRejection', (err) => {
  console.log('Error Internal Server: ', err.message);
  process.exit(1);
});
