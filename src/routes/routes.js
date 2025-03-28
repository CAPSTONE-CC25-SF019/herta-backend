import {
  getAllDiseases,
  getDiseaseById,
  getDiseasesBySymptoms,
  updateDisease
} from '../controller/DiseaseController.js';

const diseaseRoutes = [
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
    method: 'PUT',
    path: '/diseases/{id}',
    handler: updateDisease
  },
];

export default diseaseRoutes;
