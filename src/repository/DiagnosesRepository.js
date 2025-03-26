import models from '../model/models.js';
import BaseRepositoryImpl from './BaseRepositoryImpl.js';


export default class DiagnosesRepository extends BaseRepositoryImpl {
    /**
     * Create New Instance Diagnoses
     */
    constructor() {
        super(models.Diagnosis);
        /**
         * @type {models.Diagnosis}
         */
        this.diagnoses = models.Diagnosis;
    }

    /**
     * 
     * @param {{ predictions: { symptoms: string[], diseaseId: string }[], user: Object }} options
     */
    async create(options) {
        this.diagnoses.create({
            data: {

            }
        });
    }
}