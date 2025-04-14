// diagnoses.routes.js
import MachineLearningAPI from '../config/api/MachineLearningAPI.js';
import DiagnosesController from '../controller/DiagnosesController.js';
import DiagnosesService from '../service/DiagnosesService.js';
import generateBadRequestResponse from '../utils/generateBadRequestResponse.js';
import swaggerPlugins from '../utils/swaggerPlugins.js';
import DiagnosesValidation from '../validation/diagnoses.validation.js';
import DiseasesValidation from '../validation/diseases.validation.js';
import ResponseValidation from '../validation/response.validation.js';
import SymptomsValidation from '../validation/symptoms.validation.js';
import UsersValidation from '../validation/users.validation.js';

/**
 * Register diagnoses-related API routes
 *
 * @returns {Array<Object>} Array of Hapi route definitions
 */
export default function () {
  const diagnosesService = new DiagnosesService(new MachineLearningAPI());
  const diagnosesController = new DiagnosesController(diagnosesService);

  const failAction = (request, h, err) => {
    return generateBadRequestResponse(h, err, 'DIAGNOSES_VALIDATION_ERROR');
  };

  return [
    // Create a new diagnosis
    {
      method: 'POST',
      path: '/api/v1/diagnoses',
      options: {
        auth: 'jwt',
        description: 'Create a new diagnosis',
        notes:
          'Creates a new medical diagnosis record. Requires authentication.',
        tags: ['api', 'diagnoses'],
        validate: {
          payload: DiagnosesValidation.create,
          failAction
        },
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        handler: (request, h) => diagnosesController.create(request, h)
      }
    },

    // Update a diagnosis by ID
    {
      method: 'PUT',
      path: '/api/v1/diagnoses/{id}',
      options: {
        auth: 'jwt',
        description: 'Update diagnosis information',
        notes:
          'Updates a diagnosis record for the given ID. Requires authentication.',
        tags: ['api', 'diagnoses'],
        validate: {
          payload: DiagnosesValidation.create,
          params: DiagnosesValidation.filterById,
          failAction
        },
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        handler: (request, h) => diagnosesController.update(request, h)
      }
    },

    // Delete a diagnosis by ID
    {
      method: 'DELETE',
      path: '/api/v1/diagnoses/{id}',
      options: {
        auth: 'jwt',
        description: 'Delete a diagnosis',
        notes:
          'Deletes a diagnosis record for the given ID. Requires authentication.',
        tags: ['api', 'diagnoses'],
        validate: {
          params: DiagnosesValidation.filterById,
          failAction
        },
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        handler: (request, h) => diagnosesController.delete(request, h)
      }
    },

    // Get diagnoses by user ID - Admin only
    {
      method: 'GET',
      path: '/api/v1/diagnoses/relationship/users/{id}',
      options: {
        auth: 'jwt',
        description: 'Get diagnoses by user ID',
        notes:
          'Returns all diagnosis records for a specific user. Admin access only.',
        tags: ['api', 'diagnoses', 'users', 'relationships', 'admin'],
        validate: {
          params: UsersValidation.filterById,
          failAction
        },
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        handler: (request, h) => diagnosesController.getByUserId(request, h)
      }
    },

    // Get current user's diagnoses
    {
      method: 'GET',
      path: '/api/v1/diagnoses/self/relationship/users',
      options: {
        auth: 'jwt',
        description: "Get current user's diagnoses",
        notes: 'Returns all diagnosis records for the authenticated user.',
        tags: ['api', 'diagnoses', 'users', 'relationships'],
        validate: {
          failAction
        },
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        handler: (request, h) => diagnosesController.getSelfDetail(request, h)
      }
    },

    // Get current user's diagnoses by disease ID
    {
      method: 'GET',
      path: '/api/v1/diagnoses/self/relationship/diseases/{id}',
      options: {
        auth: 'jwt',
        description: "Get current user's diagnoses by disease ID",
        notes:
          "Returns the authenticated user's diagnoses for a specific disease.",
        tags: ['api', 'diagnoses', 'diseases', 'relationships'],
        validate: {
          params: DiseasesValidation.filterById,
          failAction
        },
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        handler: (request, h) =>
          diagnosesController.getSelfByDiseaseId(request, h)
      }
    },

    // Get all diagnoses by disease ID - Admin only
    {
      method: 'GET',
      path: '/api/v1/diagnoses/relationship/diseases/{id}',
      options: {
        auth: 'jwt',
        description: 'Get all diagnoses by disease ID',
        notes:
          'Returns all diagnoses for a specific disease. Admin access only.',
        tags: ['api', 'diagnoses', 'diseases', 'relationships', 'admin'],
        validate: {
          params: DiseasesValidation.filterById,
          failAction
        },
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        handler: (request, h) => diagnosesController.getByDiseaseId(request, h)
      }
    },

    // Get diagnoses by symptoms - Admin only
    {
      method: 'GET',
      path: '/api/v1/diagnoses/relationship/symptoms',
      options: {
        auth: 'jwt',
        description: 'Get all diagnoses by symptoms',
        notes:
          'Returns all diagnoses associated with specified symptoms. Admin access only.',
        tags: ['api', 'diagnoses', 'symptoms', 'relationships', 'admin'],
        validate: {
          query: SymptomsValidation.filterByNames,
          failAction
        },
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        handler: (request, h) => diagnosesController.getBySymptoms(request, h)
      }
    },

    // Get all diagnoses with pagination - Admin only
    {
      method: 'GET',
      path: '/api/v1/diagnoses',
      options: {
        auth: 'jwt',
        description: 'Get all diagnoses with pagination',
        notes: 'Returns a paginated list of all diagnoses. Admin access only.',
        tags: ['api', 'diagnoses', 'admin'],
        validate: {
          query: DiagnosesValidation.pagination,
          failAction
        },
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        handler: (request, h) => diagnosesController.getAll(request, h)
      }
    },

    // Get current user's diagnoses by symptoms
    {
      method: 'GET',
      path: '/api/v1/diagnoses/self/relationship/symptoms',
      options: {
        auth: 'jwt',
        description: "Get current user's diagnoses by symptoms",
        notes:
          "Returns the authenticated user's diagnoses associated with specified symptoms.",
        tags: ['api', 'diagnoses', 'symptoms', 'relationships'],
        validate: {
          query: SymptomsValidation.filterByNames,
          failAction
        },
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        handler: (request, h) =>
          diagnosesController.getSelfBySymptoms(request, h)
      }
    },

    // Get diagnosis statistics for a user - Admin only
    {
      method: 'GET',
      path: '/api/v1/diagnoses/relationship/users/{id}/statistics',
      options: {
        auth: 'jwt',
        description: 'Get diagnosis statistics for a user',
        notes:
          'Returns statistical data about diagnoses for a specific user. Admin access only.',
        tags: ['api', 'diagnoses', 'users', 'statistics', 'admin'],
        validate: {
          params: UsersValidation.filterById,
          failAction
        },
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        handler: (request, h) => diagnosesController.getStatistics(request, h)
      }
    },

    // Get current user's diagnosis statistics
    {
      method: 'GET',
      path: '/api/v1/diagnoses/self/relationship/users/statistics',
      options: {
        auth: 'jwt',
        description: "Get current user's diagnosis statistics",
        notes:
          'Returns statistical data about diagnoses for the authenticated user.',
        tags: ['api', 'diagnoses', 'users', 'statistics'],
        validate: {
          failAction
        },
        plugins: {
          ...swaggerPlugins
        },
        response: {
          ...ResponseValidation
        },
        handler: (request, h) =>
          diagnosesController.getSelfStatistics(request, h)
      }
    }
  ];
}
