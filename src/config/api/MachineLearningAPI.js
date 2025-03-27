export default class MachineLearningAPI {
  constructor() {
    this.baseUrl = process.env.ML_API_BASE_URL;
  }
  /**
   * Send Predictions ML API with data is symptoms
   * @async
   * @param {{ symptoms: string[] }} data
   * @returns {Object}
   * @throws {Error}
   */
  async predictions(data) {}
}
