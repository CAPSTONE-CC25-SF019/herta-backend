import {
  getAllDiseases,
  getDiseaseById,
  getDiseasesBySymptoms,
  getDiseasesWithPagination,
  updateDisease
} from '../controller/DiseaseController.js';
import {
  getAllSymptoms,
  getSymptomById,
  getSymptomwithPagination,
  updateSymptom
} from '../controller/SymptomController.js';

const Routes = [
  // Disease Routes
  {
    method: 'GET',
    path: '/diseases',
    handler: getAllDiseases
  },
  {
    method: 'GET',
    path: '/diseases/{id}',
    handler: getDiseaseById
  },
  {
    method: 'GET',
    path: '/diseases/symptoms',
    handler: getDiseasesBySymptoms
  },
  {
    method: 'GET',
    path: '/diseases/paginated',
    handler: getDiseasesWithPagination
  },
  {
    method: 'PUT',
    path: '/diseases/{id}',
    handler: updateDisease
  },

  // Symptom Routes
  {
    method: 'GET',
    path: '/symptoms',
    handler: getAllSymptoms
  },
  {
    method: 'GET',
    path: '/symptoms/{id}',
    handler: getSymptomById
  },
  {
    method: 'GET',
    path: '/symptoms/paginated',
    handler: getSymptomwithPagination
  },
  {
    method: 'PUT',
    path: '/symptoms/{id}',
    handler: updateSymptom
  }
];

export default Routes;
