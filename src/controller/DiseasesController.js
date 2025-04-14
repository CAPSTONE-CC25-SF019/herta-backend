import BaseController from './BaseController.js';

export default class DiseasesController extends BaseController {
  /**
   *
   * @param diseasesService {DiseasesService}
   */
  constructor(diseasesService) {
    super(diseasesService.log);
    this.diseasesService = diseasesService;
  }

  async getAll(request, h) {
    try {
      this.log.info(
        `Retrieve request get all by query params: ${JSON.stringify(request.query)}`
      );

      // Getting the disease by pagination
      const { page, size } = request.query;
      this.log.info(`Getting disease by page ${page} with size ${size}`);
      const { data, pagination } = await this.diseasesService.getAll({
        page,
        size
      });

      // Successfully get from disease service
      this.log.info(
        `Successfully get all disease by page ${page} with size ${size}`
      );

      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_GET_ALL_DISEASE',
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
        `Getting error when get all disease by pagination: ${error.message}`
      );
      return this.handleError({
        hapiResponse: h,
        error,
        messageInternalServer: `An unexpected error occurred during disease get all diseases.\n${error.message}`
      });
    }
  }

  async getById(request, h) {
    try {
      this.log.info(
        `retrieve request get by id ${JSON.stringify(request.params)}`
      );
      const { data } = await this.diseasesService.getById(request.params.id);
      this.log.info(
        `Successfully Retrieve request get by id ${request.params.id}`
      );
      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_GET_BY_ID_DISEASE',
          data,
          status: 200,
          code: 'STATUS_OK'
        }
      });
    } catch (error) {
      this.log.error(`Getting error when get by id ${request.params.id}`);
      return this.handleError({
        hapiResponse: h,
        error,
        messageInternalServer: `An unexpected error occurred during get disease by id.\n${error.message}`
      });
    }
  }

  async getBySymptoms(request, h) {
    try {
      this.log.info(
        `retrieve request get by symptoms name ${JSON.stringify(request.query)}`
      );
      const { data } = await this.diseasesService.getBySymptoms(
        request.query.names
      );
      this.log.info(
        `Successfully Retrieve request get by symptoms name ${JSON.stringify(request.query)}`
      );
      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_GET_ALL_DISEASE_BY_SYMPTOMS',
          data,
          status: 200,
          code: 'STATUS_OK'
        }
      });
    } catch (error) {
      return this.handleError({
        hapiResponse: h,
        error,
        messageInternalServer: `An unexpected error occurred during get diseases by name symptoms.\n${error.message}`
      });
    }
  }

  async update(request, h) {
    try {
      this.log.info(
        `retrieve request update by id ${JSON.stringify(request.params)}`
      );
      // Processing Update
      await this.diseasesService.update(request.params.id, request.payload);
      this.log.info(
        `Successfully Retrieve request update by id ${request.params.id}`
      );
      return this.createResponse({
        hapiResponse: h,
        response: {
          title: 'SUCCESSFULLY_UPDATE_DISEASE_BY_ID',
          data: {
            message: 'successfully updated disease'
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
        messageInternalServer: `An unexpected error occurred during update disease.\n${error.message}`
      });
    }
  }
}
