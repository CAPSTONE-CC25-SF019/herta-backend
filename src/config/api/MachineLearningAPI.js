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
    try {
      const { symptoms } = data;
      const response = await fetch(this.baseUrl + '/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms }),
      });
      const responseJson = await response.json();
      const disease = await models.Disease.findFirst({
        where: {
          name: responseJson?.predicted_disease,
        },
        select: {
          id: true
        }
      });

      const symptomNames = (await models.Symptom.findMany({
        where: {
          diseases: {
            some: {
              disease: {
                id: disease?.id
              }
            }
          }
        },
        select: {
          name: true
        }
      })).map((symptom) => (symptom.name));


      return [{diseaseId: disease?.id, symptomNames , confidence: parseInt(responseJson?.confidence.split('%')[0])}]
    } catch (error) {
      console.warn(error?.message);
      throw error;
    }
  }
}
