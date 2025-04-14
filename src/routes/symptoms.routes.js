// symptoms.routes.js
import SymptomsController from '../controller/SymptomsController.js';
import SymptomsService from '../service/SymtompsService.js';
import generateBadRequestResponse from '../utils/generateBadRequestResponse.js';
import swaggerPlugins from '../utils/swaggerPlugins.js';
import ResponseValidation from '../validation/response.validation.js';
import SymptomsValidation from '../validation/symptoms.validation.js';

/**
 * Register symptoms-related API routes
 *
 * @returns {Array<Object>} Array of Hapi route definitions
 */
export default function () {
  const symptomsService = new SymptomsService();
  const symptomsController = new SymptomsController(symptomsService);

  const failAction = (request, h, err) => {
    return generateBadRequestResponse(h, err, 'SYMPTOMS_VALIDATION_ERROR');
  };

  return [
    // Get all symptoms with pagination
    {
      method: 'GET',
      path: '/api/v1/symptoms',
      options: {
        description: 'Get all symptoms with pagination',
        notes: 'Returns a paginated list of medical symptoms.',
        tags: ['api', 'symptoms'],
        plugins: {},
        response: {
          ...ResponseValidation
        },
        validate: {
          query: SymptomsValidation.pagination,
          failAction
        },
        handler: (request, h) => symptomsController.getAll(request, h)
      }
    },

    // Get a symptom by its name
    {
      method: 'GET',
      path: '/api/v1/symptoms/{name}',
      options: {
        description: 'Get symptom by name',
        notes: 'Returns a specific symptom based on its name.',
        tags: ['api', 'symptoms'],
        plugins: {},
        response: {
          ...ResponseValidation
        },
        validate: {
          params: SymptomsValidation.filterByName,
          failAction
        },
        handler: (request, h) => symptomsController.getByName(request, h)
      }
    },

    // Update Symptom By ID
    {
      method: 'PUT',
      path: '/api/v1/symptoms/{id}',
      options: {
        auth: 'jwt',
        description: 'Update symptom information',
        notes:
          'Updates symptom details for the given symptom ID. Requires authentication.',
        tags: ['api', 'symptoms'],
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        validate: {
          params: SymptomsValidation.filterById,
          payload: SymptomsValidation.update,
          failAction
        },
        handler: (request, h) => symptomsController.update(request, h)
      }
    },

    // Get related diseases by list of symptom names
    {
      method: 'GET',
      path: '/api/v1/symptoms/relationship/diseases',
      options: {
        description: 'Get diseases associated with symptoms',
        notes:
          'Returns diseases that are associated with the provided list of symptom names.',
        tags: ['api', 'symptoms', 'diseases', 'relationships'],
        plugins: {},
        response: {
          ...ResponseValidation
        },
        validate: {
          query: SymptomsValidation.filterByNames,
          failAction
        },
        handler: (request, h) => symptomsController.getByDiseases(request, h)
      }
    },

    // Get related diagnoses by symptom ID
    {
      method: 'GET',
      path: '/api/v1/symptoms/relationship/diagnoses/{id}',
      options: {
        description: 'Get diagnoses related to a symptom',
        notes:
          'Returns diagnoses that are associated with the specified symptom ID.',
        tags: ['api', 'symptoms', 'diagnoses', 'relationships'],
        plugins: {},
        response: {
          ...ResponseValidation
        },
        validate: {
          params: SymptomsValidation.filterById,
          failAction
        },
        handler: (request, h) => symptomsController.getByDiagnosisId(request, h)
      }
    }
  ];
}
