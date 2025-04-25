import Joi from 'joi';

import DiseasesValidation from './diseases.validation.js';

export default {
  create: Joi.object({
    symptomNames: Joi.alternatives()
      .try(Joi.array().items(Joi.string()), Joi.string())
      // eslint-disable-next-line
      .custom((value, helpers) => {
        if (typeof value === 'string') {
          return [value];
        }
        return value;
      }, 'Convert string to array')
      .description(
        'Filter symptoms by name(s), accepting either a single name or an array of names'
      )
      .messages({
        'alternatives.types': 'name must be a string or array of strings',
        'array.base': 'name must be an array of strings'
      })
  }).label('DiagnosesCreateBody'),
  filterById: DiseasesValidation.filterById,
  pagination: DiseasesValidation.pagination
};
