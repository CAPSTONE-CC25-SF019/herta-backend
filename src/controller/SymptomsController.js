// eslint-disable-next-line
import SymptomsService from '../service/SymtompsService.js';
import BaseController from './BaseController.js';

export default class SymptomsController extends BaseController {
  /**
   * Create Instance SymptomsController
   * @param symptomsService {SymptomsService}
   */
  constructor(symptomsService) {
    super(symptomsService.log);
    this.symptomsService = symptomsService;
  }

  async getAll(request, h) {
    try {
      this.log.info(
        `Retrieve request get all by query params: ${JSON.stringify(request.query)}`
      );

      // Getting the symptoms by pagination
      const { page, size } = request.query;
      this.log.info(`Getting symptom by page ${page} with size ${size}`);
      const { data, pagination } = await this.symptomsService.getAll({
        page,
        size
      });

      // Successfully get from symptom service
      this.log.info(
        `Successfully get all symptom by page ${page} with size ${size}`
      );

      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_GET_ALL_SYMPTOMS',
          data: data,
          status: 200,
          code: 'STATUS_OK',
          meta: {
            pagination
          }
        }
      });
    } catch (error) {
      this.log.error(
        `Getting error when get all symptom by pagination: ${error.message}`
      );
      return this.handleError({
        hapiResponse: h,
        error,
        messageInternalServer: `An unexpected error occurred during disease get all symptoms.\n${error.message}`
      });
    }
  }

  async getByName(request, h) {
    try {
      this.log.info(
        `retrieve request get by name ${JSON.stringify(request.params)}`
      );
      const { data } = await this.symptomsService.getByName(
        request.params.name
      );
      this.log.info(
        `Successfully Retrieve request get by name ${request.params.name}`
      );
      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_GET_BY_SYMPTOM_NAME',
          data,
          status: 200,
          code: 'STATUS_OK'
        }
      });
    } catch (error) {
      this.log.error(`Getting error when get by name ${request.params.name}`);
      return this.handleError({
        hapiResponse: h,
        error,
        messageInternalServer: `An unexpected error occurred during get symptom by name.\n${error.message}`
      });
    }
  }

  async getByDiseases(request, h) {
    try {
      this.log.info(
        `retrieve request get by diseases name ${JSON.stringify(request.query)}`
      );
      const { data } = await this.symptomsService.getByDiseases(
        request.query.names
      );
      this.log.info(
        `Successfully Retrieve request get by diseases name ${JSON.stringify(request.query)}`
      );
      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_GET_ALL_SYMPTOMS_BY_DISEASE_NAME ',
          data,
          status: 200,
          code: 'STATUS_OK'
        }
      });
    } catch (error) {
      return this.handleError({
        hapiResponse: h,
        error,
        messageInternalServer: `An unexpected error occurred during get symptoms by diseases name.\n${error.message}`
      });
    }
  }

  async update(request, h) {
    try {
      this.log.info(
        `retrieve request update by id ${JSON.stringify(request.params)}`
      );
      // Processing Update
      await this.symptomsService.update(request.params.id, request.payload);
      this.log.info(
        `Successfully Retrieve request update by id ${request.params.id}`
      );
      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_UPDATE_SYMPTOM_BY_ID',
          data: {
            message: 'successfully updated symptom'
          },
          status: 200,
          code: 'STATUS_OK'
        }
      });
    } catch (error) {
      this.log.error(
        `Error when update request update by id ${request.params.id}`
      );
      return this.handleError({
        hapiResponse: h,
        error,
        messageInternalServer: `An unexpected error occurred during update symptoms.\n${error.message}`
      });
    }
  }

  async getByDiagnosisId(request, h) {
    try {
      this.log.info(
        `retrieve request get by diagnosisId ${JSON.stringify(request.params)}`
      );
      const { data } = await this.symptomsService.getByDiagnosisId(
        request.params.id
      );
      this.log.info(
        `Successfully retrieve request get by diagnosisId ${JSON.stringify(request.params.id)}`
      );
      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_GET_SYMPTOM_BY_DIAGNOSIS_ID',
          data,
          status: 200,
          code: 'STATUS_OK'
        }
      });
    } catch (error) {
      this.log.error(
        `Error when get symptoms by diagnosis id ${request.params.id}`
      );
      return this.handleError({
        hapiResponse: h,
        error,
        messageInternalServer: `An unexpected error occurred during get symptoms by diagnosis id ${request.params.id}.\n${error.message}`
      });
    }
  }
}
