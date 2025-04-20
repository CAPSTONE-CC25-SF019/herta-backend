// eslint-disable-next-line
import DiagnosesService from '../service/DiagnosesService.js';
import BaseController from './BaseController.js';





export default class DiagnosesController extends BaseController {
  /**
   * 
   * @param diagnosesService {DiagnosesService}
   */
  constructor(diagnosesService) {
    super(
      diagnosesService.log
    );
    this.diagnosesService = diagnosesService;
  }
  
  async create(request, h) {
    try {
      const credential = request.auth.credentials;
      this.log.info(`Request received to create diagnose with id ${credential?.id}`);
      
      const { symptomNames } = request.payload;
      const { data } = await this.diagnosesService.create({ credential, symptomNames});
      this.log.info(`Successfully Create diagnose with id ${data?.id}`);
      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_CREATE_DIAGNOSE',
          data,
          status: 201,
          code: 'STATUS_CREATED'
        }
      });
    } catch (err) {
      this.log.error(`Getting error when creating diagnose cause ${err?.message}`);
      return this.handleError({
        hapiResponse: h,
        error: err,
        messageInternalServer: `an unexpected error occurred during create the diagnose.\n${err?.message}.`
      })
    }
  }

  async update(request, h) {
    try {
      const credential = request.auth.credentials;
      this.log.info(`Request received to update diagnose with id ${credential?.id}`);

      // Destructuring input from client
      const { id } = request.params;
      const { symptomNames } = request.payload;
      const { data } = await this.diagnosesService.update({ userId: credential?.id, id }, symptomNames);
      this.log.info(`Successfully Update diagnose with id ${id}`);

      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_UPDATE_DIAGNOSE',
          data,
          status: 200,
          code: 'STATUS_OK',
        }
      });
    } catch (err) {
      this.log.error(`Getting error when updating diagnose cause ${err?.message}`);
      return this.handleError({
        hapiResponse: h,
        error: err,
        messageInternalServer: `an unexpected error occurred during update the diagnose.\n${err?.message}.`
      })
    }
  }

  async delete(request, h) {
    try {
      const credential = request.auth.credentials;
      this.log.info(`Request received to update diagnose with id ${credential?.id}`);

      // Destructuring input from client
      const { id } = request.params;
      await this.diagnosesService.delete({ userId: credential?.id, id });
      this.log.info(`Successfully delete diagnose with id ${JSON.stringify(id)}`);

      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_DELETE_DIAGNOSE',
          data: {
            message: `Successfully deleted diagnose with id: ${id}`,
          },
          status: 200,
          code: 'STATUS_OK',
        }
      });
    } catch (err) {
      this.log.error(`Getting error when deleting diagnose cause ${err?.message}`);
      return this.handleError({
        hapiResponse: h,
        error: err,
        messageInternalServer: `an unexpected error occurred during delete the diagnose.\n${err?.message}.`
      })
    }
  }
  
  async getAll(request, h) {
    try {
      this.log.info(`Request received to get all diagnose`);
      
      const { page, size } = await request.query;
      this.log.info(`Processing Get all diagnose ${page} of ${size}`);
      
      const { data, pagination } = await this.diagnosesService.getAllWithPagination({
        page,
        size
      });

      this.log.info(`Successfully Get all diagnose ${page} of ${size}`);

      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_GET_ALL_DIAGNOSE',
          data,
          status: 200,
          code: 'STATUS_OK',
          meta: {
            pagination
          }
        }
      });
    } catch (err) {
      this.log.error(`Getting error when request all diagnose.\n${err?.message}`);
      return this.handleError({
        hapiResponse: h,
        error: err,
        messageInternalServer: `an unexpected error occurred during getting all diagnose.\n${err?.message}.`
      })
    }
  }

  async getSelfStatistics(request, h) {
    try {
      // Getting user id from credentials
      const { id } = request.auth.credentials;
      this.log.info(`Request received to get statistics diagnose with users id ${id}`);
      this.log.info(`Processing Get statistics diagnose with users id ${id}`);

      const { data } = await this.diagnosesService.getStatistics(id);
      this.log.info(`Successfully Get statistics diagnose with users id ${id}`);

      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_GET_DIAGNOSE_STATISTICS',
          data,
          status: 200,
          code: 'STATUS_OK',
        }
      });
    } catch (err) {
      this.log.error(`Getting error when getting statistics diagnose with users id.\n${err?.message}`);
      return this.handleError({
        hapiResponse: h,
        error: err,
        messageInternalServer: `an unexpected error occurred during getting statistics.\n${err?.message}.`
      });
    }
  }

  async getStatistics(request, h) {
    try {
      // Getting User ID
      const { id } = request.params;
      this.log.info(`Request received to get statistics diagnose with users id ${id}`);
      this.log.info(`Processing Get statistics diagnose with users id ${id}`);

      const { data } = await this.diagnosesService.getStatistics(id);
      this.log.info(`Successfully Get statistics diagnose with users id ${id}`);

      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_GET_DIAGNOSE_STATISTICS',
          data,
          status: 200,
          code: 'STATUS_OK',
        }
      });
    } catch (err) {
      this.log.error(`Getting error when getting statistics diagnose with users id.\n${err?.message}`);
      return this.handleError({
        hapiResponse: h,
        error: err,
        messageInternalServer: `an unexpected error occurred during getting statistics.\n${err?.message}.`
      });
    }
  }

  async getBySymptoms(request, h) {
    try {
      const { names } = request.query;
      this.log.info(`Request received to get diagnoses with symptoms`);
      // Processing Get Diagnose
      this.log.info(`Processing Get Diagnose with Symptoms`);
      const { data } = await this.diagnosesService.getBySymptoms(names);
      this.log.info(`Successfully Get Diagnose with Symptoms`);

      // return response
      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_GET_DIAGNOSE_BY_SYMPTOMS',
          data,
          status: 200,
          code: 'STATUS_OK',
        }
      });
    } catch (err) {
      this.log.error(`Getting error when getting diagnoses with symptoms.\n${err?.message}`);
      return this.handleError({
        hapiResponse: h,
        error: err,
        messageInternalServer: `an unexpected error occurred during getting diagnoses with symptoms.\n${err?.message}.`
      });
    }
  }

  async getSelfBySymptoms(request, h) {
    try {
      // Getting symptoms
      const { names } = request.query;
      // Getting Credentials
      const credentials = request.auth.credentials;
      this.log.info(`Request received to get diagnoses with symptoms`);
      // Processing Get Diagnose
      this.log.info(`Processing Get Diagnose with Symptoms`);
      const { data } = await this.diagnosesService.getBySymptomsAndUserId({ userId: credentials?.id, symptoms: names});
      this.log.info(`Successfully Get Diagnose with Symptoms`);

      // return response
      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_GET_DIAGNOSE_BY_SYMPTOMS',
          data,
          status: 200,
          code: 'STATUS_OK',
        }
      });
    } catch (err) {
      this.log.error(`Getting error when getting diagnoses with symptoms.\n${err?.message}`);
      return this.handleError({
        hapiResponse: h,
        error: err,
        messageInternalServer: `an unexpected error occurred during getting diagnoses with symptoms.\n${err?.message}.`
      });
    }
  }


  async getByDiseaseId(request, h) {
    try {
      // Getting disease id
      const { id } = request.params;
      // Processing Get Diagnose By DiseaseId
      this.log.info(`Request received to get diagnoses with disease id`);
      this.log.info(`Processing Get Diagnose with Symptoms`);

      const { data } = await this.diagnosesService.getByDiseaseId(id);
      this.log.info(`Successfully Get Diagnose with Symptoms`);

      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_GET_DIAGNOSE_BY_DISEASE_ID',
          data,
          status: 200,
          code: 'STATUS_OK',
        }
      });
    } catch (err) {
      this.log.error(`Getting error when getting diagnoses with disease id.\n${err?.message}`);
      return this.handleError({
        hapiResponse: h,
        error: err,
        messageInternalServer: `an unexpected error when occurred during getting diagnoses with disease id.\n${err?.message}.`,
      });
    }
  }

  async getSelfByDiseaseId(request, h) {
    try {
      // Getting disease id
      const { id } = request.params;
      // Getting credentials
      const credentials = request.auth.credentials;
      // Processing Get Diagnose By DiseaseId
      this.log.info(`Request received to get diagnoses with disease id`);
      this.log.info(`Processing Get Diagnose with Symptoms`);

      const { data } = await this.diagnosesService.getByDiseaseIdAndUserId({ diseaseId: id, userId: credentials?.id});
      this.log.info(`Successfully Get Diagnose with Symptoms`);

      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_GET_DIAGNOSE_BY_DISEASE_ID',
          data,
          status: 200,
          code: 'STATUS_OK',
        }
      });
    } catch (err) {
      this.log.error(`Getting error when getting diagnoses with disease id.\n${err?.message}`);
      return this.handleError({
        hapiResponse: h,
        error: err,
        messageInternalServer: `an unexpected error when occurred during getting diagnoses with disease id.\n${err?.message}.`,
      });
    }
  }

  async getSelfDetail(request, h) {
    try {
      // Getting credentials
      const credentials = request.auth.credentials;

      this.log.info(`Request received to get diagnose by credentials`)
      this.log.info(`Processing Get Diagnose with Credentials`);

      const { data } = await this.diagnosesService.getByUserId(credentials?.id);
      this.log.info(`Successfully Get Diagnose with Credentials`);
      // Return response
      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_GET_DIAGNOSE_DETAIL',
          data,
          status: 200,
          code: 'STATUS_OK',
        }
      });
    } catch (err) {
      this.log.error(`Getting error when get diagnose by credentials.\n${err?.message}`);
      return this.handleError({
        hapiResponse: h,
        error: err,
        messageInternalServer: `an unexpected error when occurred during getting diagnose by credentials.\n${err?.message}.`,
      });
    }
  }

  async getByUserId(request, h) {
    try {
      // Getting users id
      const { id } = request.params;

      this.log.info(`Request received to get diagnose by user id`);
      this.log.info(`Processing Get Diagnose with user id`);

      const { data } = await this.diagnosesService.getByUserId(id);
      this.log.info(`Successfully Get Diagnose with User ID`);
      // Return response
      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_GET_DIAGNOSE_DETAIL',
          data,
          status: 200,
          code: 'STATUS_OK',
        }
      });
    } catch (err) {
      this.log.error(`Getting error when get diagnose by users id.\n${err?.message}`);
      return this.handleError({
        hapiResponse: h,
        error: err,
        messageInternalServer: `an unexpected error when occurred during getting diagnose by users id.\n${err?.message}.`,
      });
    }
  }
}