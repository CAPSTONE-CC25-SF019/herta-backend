import models from '../../model/models.js';

export default class MachineLearningAPI {
  constructor() {
    this.baseUrl = process.env.ML_API_BASE_URL;
  }
  /**
   * Send Predictions ML API with data is symptoms
   * @async
   * @param {{ symptoms: Array<string>}} data
   * @returns {Array<Object>}
   * @throws {Error}
   */
  async predictions(data) {
    return models.Disease.findMany({
      where: {
        symptoms: {
          some: {
            symptom: {
              name: {
                in: data.symptoms
              }
            }
          }
        }
      },
      select: {
        id: true,
        symptoms: {
          select: {
            symptom: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
  }
}
