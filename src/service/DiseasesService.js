import BaseService from './BaseService.js';
import DiseaseRepository from '../repository/DiseaseRepository.js';
import ErrorService from '../error/ErrorService.js';
import Logger from '../config/log/winston.js';

export default class DiseasesService extends BaseService {
  constructor() {
    super(new DiseaseRepository(), 'disease');

    /**
     *
     * @type {DiseaseRepository}
     */
    this.diseaseRepository = this.repository;

    /**
     *
     * @type {winston.Logger}
     */
    this.log = Logger.app;
  }

  /**
   *
   * @param options {{size: number, page: number}}
   * @returns {Promise<{data: Array, pagination: {page: number, limit: number}}>}
   */
  async getAll(options) {
    try {
      this.log.info(`get request by paginate with page to ${page} with limit ${size}`);
      const { page, size } = options;
      const { diseases, pagination} = await this.diseaseRepository.getAllPagination({pagination: {page, limit: size}});
      return {
        data: diseases,
        pagination,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getById(id) {
    try {
      this.log.info(`receive from request by id ${id} to get disease`);
     const disease = await this.diseaseRepository.getDiseaseById(id);
     if (!disease) {
       this.log.error(`disease not found by id ${id}`);
       throw ErrorService.notFound({
         entityName: 'disease',
         fieldName: 'id',
         fieldValue: id
       });
     }
     this.log.info(`successfully receive from request by id ${id}`);
     return {
       data: disease
     };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getBySymptoms(symptoms) {
    try {
      const diseases = await this.diseaseRepository.getDiseasesBySymptoms(symptoms);
      return {
        data: diseases
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

}