import Joi from 'joi';
import DiseasesValidation from './diseases.validation.js';

export default {
  ...DiseasesValidation,

  update: Joi.object({
    description: Joi.string().min(1).required().description('Updated description for the symptom').messages({
      'string.min': 'the description symptoms must be greater than one character',
      'any.required': 'this description is required'
    })
  }).label('SymptomUpdateBody'),

  filterByName: Joi.object({
    name: Joi.string().min(1).required().description('Filter symptoms by name').messages({
      'string.min': 'the name symptom must be greater than one character',
      'any.required': 'this name symptom is required'
    })
  }).label('FilterByNameQuery'),
};
