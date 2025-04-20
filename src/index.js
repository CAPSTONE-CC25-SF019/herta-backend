import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import HapiSwagger from 'hapi-swagger';
import Joi from 'joi';
import process from 'node:process';
import Routes from './routes/routes.js';
import statusToCode from './utils/statusToCode.js';

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
          origin: ['*'],
          credentials: true
        }
      }
    });
    const swaggerOptions = {
      info: {
        title: 'Herta API Documentation',
        version: process.env.API_VERSION
      },
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header'
        }
      }
    };

    await server.register([
      Inert,
      Vision,
      {
        plugin: HapiSwagger,
        options: swaggerOptions,
        grouping: 'tags'
      }
    ]);
    await Routes(server);
    server.validator(Joi);
    server.ext('onPreResponse', (request, h) => {
      const response = request.response;

      if (response.isBoom) {
        const { output, message, data } = response;
        const statusCode = output.statusCode;

        const customError = {
          errors: [
            {
              title: statusToCode(statusCode),
              details: data || message,
              status: statusCode,
              code: statusToCode(statusCode)
            }
          ]
        };

        return h.response(customError).code(statusCode);
      }

      return h.continue;
    });

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
