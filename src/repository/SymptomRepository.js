import BaseRepositoryImpl from './BaseRepositoryImpl.js';
import models from '../model/models.js';


export default class SymptomRepository extends BaseRepositoryImpl {
  constructor() {
    super(models.Symptom);
    this.symptom = models.Symptom;
    this.diagnosis = models.SymptomsOnDiagnoses;
    this.disease = models.SymptomsOnDiseases;
  }

  /**
   *
   * @param name {string}
   * @param options {{diagnoses: boolean,diseases: boolean}}
   * @returns {Promise<Prisma.Prisma__SymptomClient<GetResult<Prisma.$SymptomPayload<DefaultArgs>, {where: {name}}, "findFirstOrThrow", Prisma.PrismaClientOptions>, never, DefaultArgs, Prisma.PrismaClientOptions>>}
   */
  async getSymptomsByName(name, options) {
    const args = {
      where: {
        name
      }
    }
    if ( options ) args.include = options;
    return this.symptom.findFirstOrThrow(args);
  }

  /**
   *
   * @param diagnosisId {string}
   * @returns {PrismaPromise<GetFindResult<Prisma.$SymptomPayload<DefaultArgs>, {where: {diagnoses: {some: {diagnosisId}}}, include: {diagnoses: boolean}}, Prisma.PrismaClientOptions>[]>}
   */
  async getAllSymptomsByDiagnosisId(diagnosisId) {
    return this.symptom.findMany({
      where: {
        diagnoses: {
          some: {
            diagnosisId: diagnosisId
          }
        }
      },
      include: {
        diagnoses: true
      }
    });
  }

  /**
   *
   * @param diseaseId {string}
   * @returns {PrismaPromise<GetFindResult<Prisma.$SymptomPayload<DefaultArgs>, {where: {diseases: {some: {diseaseId}}}, include: {diseases: boolean}}, Prisma.PrismaClientOptions>[]>}
   */
  async getAllSymptomsByDiseaseId(diseaseId) {
    return this.symptom.findMany({
      where: {
        diseases: {
          some: {
            diseaseId: diseaseId
          }
        }
      },
      include: {
        diseases: true
      }
    });
  }

  async getSymptomsById(symptoId) {
    return this.symptom.findFirst({
      where: {
        id: symptoId
      },
      include: {
        diseases: true,
        diagnoses: true
      }
    });
  }

  // async getDiagnosisBySymptom(symptom) {
  //   return this.diagnosis.findMany({
  //     where: {
  //       symptom: {
  //         name: symptom,
  //       }
  //     }
  //   });
  // }
  // async getDiagnosisBySymptomIds(symptoms) {
  //   return this.diagnosis.findMany({
  //     where: {
  //       symptom: {
  //         some: {
  //           in: {
  //             name: symptoms,
  //           }
  //         }
  //       }
  //     }
  //   })
  // }
};