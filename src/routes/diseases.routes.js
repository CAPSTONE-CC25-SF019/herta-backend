// diseases.routes.js
import DiseasesController from '../controller/DiseasesController.js';
import DiseasesService from '../service/DiseasesService.js';
import generateBadRequestResponse from '../utils/generateBadRequestResponse.js';
import swaggerPlugins from '../utils/swaggerPlugins.js';
import DiseasesValidation from '../validation/diseases.validation.js';
import ResponseValidation from '../validation/response.validation.js';

/**
 * Register diseases-related API routes
 *
 * @returns {Array<Object>} Array of Hapi route definitions
 */
export default function () {
  const diseasesService = new DiseasesService();
  const diseasesController = new DiseasesController(diseasesService);

  const failAction = (request, h, err) => {
    return generateBadRequestResponse(h, err, 'DISEASES_VALIDATION_ERROR');
  };

  return [
    // Get all diseases with pagination
    {
      method: 'GET',
      path: '/api/v1/diseases',
      options: {
        description: 'Get all diseases with pagination',
        notes: 'Returns a paginated list of medical diseases.',
        tags: ['api', 'diseases'],
        plugins: {},
        response: {
          ...ResponseValidation
        },
        validate: {
          query: DiseasesValidation.pagination,
          failAction
        },
        handler: (request, h) => diseasesController.getAll(request, h)
      }
    },

    // Update a disease by ID
    {
      method: 'PUT',
      path: '/api/v1/diseases/{id}',
      options: {
        auth: 'jwt',
        description: 'Update disease information',
        notes:
          'Updates disease details for the given disease ID. Requires authentication.',
        tags: ['api', 'diseases'],
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        validate: {
          params: DiseasesValidation.filterById,
          payload: DiseasesValidation.update,
          failAction
        },
        handler: (request, h) => diseasesController.update(request, h)
      }
    },

    // Get a disease by ID
    {
      method: 'GET',
      path: '/api/v1/diseases/{id}',
      options: {
        description: 'Get disease by ID',
        notes: 'Returns a specific disease based on its ID.',
        tags: ['api', 'diseases'],
        plugins: {},
        response: {
          ...ResponseValidation
        },
        validate: {
          params: DiseasesValidation.filterById,
          failAction
        },
        handler: (request, h) => diseasesController.getById(request, h)
      }
    },

    // Get diseases related to a set of symptoms
    {
      method: 'GET',
      path: '/api/v1/diseases/relationship/symptoms',
      options: {
        description: 'Get diseases by symptoms',
        notes:
          'Returns diseases that are associated with the provided list of symptom names.',
        tags: ['api', 'diseases', 'symptoms', 'relationships'],
        plugins: {},
        response: {
          ...ResponseValidation
        },
        validate: {
          query: DiseasesValidation.filterByNames,
          failAction
        },
        handler: (request, h) => diseasesController.getBySymptoms(request, h)
      }
    }
  ];
}
