import BaseRepositoryImpl from './BaseRepositoryImpl.js';
import models from '../model/models.js';


export default class DiseaseRepository extends BaseRepositoryImpl {
  constructor() {
    super(
      models.Disease
    );
    this.disease = models.Disease;
  }


  async getDiseasesBySymptoms(symptoms) {
    return this.disease.findMany({
      where: {
        symptoms: {
          some: {
            symptom: {
              in: symptoms,
            }
          }
        }
      },
      include: {
        symptoms: true
      }
    })
  };

  async getDiseaseById(diseaseId) {
    return this.disease.findFirst({
      where: {
        id: diseaseId
      },
      include: {
        symptoms: true
      }
    });
  }

}