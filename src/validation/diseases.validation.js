import Joi from 'joi';

import UsersValidation from './users.validation.js';

export default {
  pagination: UsersValidation.pagination,

  update: Joi.object({
    image: Joi.string()
      .uri()
      .min(5)
      .required()
      .description('Image URL representing the disease')
      .messages({
        'string.uri': 'invalid format image path',
        'string.min': 'the image path must be greater than five character',
        'any.required': 'this image is required'
      }),
    description: Joi.string()
      .min(1)
      .required()
      .description('Updated description of the disease')
      .messages({
        'string.min':
          'the description disease must be greater than one character',
        'any.required': 'this description is required'
      })
  }).label('DiseaseUpdateBody'),

  filterByNames: Joi.object({
    names: Joi.alternatives()
      .try(Joi.array().items(Joi.string()), Joi.string())
      .required()
      // eslint-disable-next-line
      .custom((value, helpers) => {
        if (typeof value === 'string') {
          return [value];
        }
        return value;
      }, 'Convert string to array')
      .description(
        'Filter diseases by name(s), accepting either a single name or an array of names'
      )
      .messages({
        'alternatives.types': 'name must be a string or array of strings',
        'array.base': 'name must be an array of strings',
        'any.required': 'this names is required'
      })
  }).label('FilterByNamesQuery'),

  filterById: Joi.object({
    id: Joi.string()
      .uuid()
      .required()
      .description('The unique UUID identifier of the disease')
      .messages({
        'string.guid': 'id must be a valid UUID',
        'any.required': 'this id is required'
      })
  }).label('FilterByIDQuery')
};
