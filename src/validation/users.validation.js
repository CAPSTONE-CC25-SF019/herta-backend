import Joi from 'joi';

export default {
  register: Joi.object({
    username: Joi.string().required().max(100).min(3).messages({
      'string.min': 'Must have at least 3 characters',
      'string.max': 'Must have max 255 characters',
      'string.required': 'This is required'
    }),
    email: Joi.string().required().email().max(255).messages({
      'string.max': 'Must have max 255 characters',
      'string.required': 'This is required',
      'email.invalid': 'Invalid format email'
    }),
    password: Joi.string().required().min(8).max(255).messages({
      'string.min': 'Must have at least 8 characters',
      'string.max': 'Must have max 255 characters',
      'string.required': 'This is required'
    }),
    role: Joi.string()
      .valid('ADMIN', 'MODERATOR', 'BASIC')
      .default('BASIC')
      .messages({
        'string.valid': "The role must be equal 'ADMIN', 'MODERATOR', 'BASIC'"
      }),
    age: Joi.number().required().min(15).max(200).messages({
      'number.valid': 'The age must be a number',
      'number.max': 'The age must be maximal 200 years old',
      'number.min': 'The age must be a minimal 15 years old',
      'number.required': 'This is required'
    }),
    image: Joi.string().uri().min(5).messages({
      'string.uri': 'Invalid format image'
    }),
    gender: Joi.string().valid('MALE', 'FEMALE').required().messages({
      'string.valid': "Gender must be equal 'MALE' or 'FEMALE'"
    })
  }),

  login: Joi.object({
    email: Joi.string().required().email().max(255).messages({
      'string.max': 'Must have max 255 characters',
      'string.required': 'This is required',
      'email.invalid': 'Invalid format email'
    }),
    password: Joi.string().required().min(8).max(255).messages({
      'string.min': 'Must have at least 8 characters',
      'string.max': 'Must have max 255 characters',
      'string.required': 'This is required'
    })
  }),

  update: Joi.object({
    username: Joi.string().required().max(100).min(3).messages({
      'string.min': 'Must have at least 3 characters',
      'string.max': 'Must have max 255 characters',
      'string.required': 'This is required'
    }),
    email: Joi.string().required().email().max(255).messages({
      'string.max': 'Must have max 255 characters',
      'string.required': 'This is required',
      'email.invalid': 'Invalid format email'
    }),
    password: Joi.string().required().min(8).max(255).messages({
      'string.min': 'Must have at least 8 characters',
      'string.max': 'Must have max 255 characters',
      'string.required': 'This is required'
    }),
    role: Joi.string()
      .valid('ADMIN', 'MODERATOR', 'BASIC')
      .default('BASIC')
      .messages({
        'string.valid': "The role must be equal 'ADMIN', 'MODERATOR', 'BASIC'"
      }),
    age: Joi.number().required().min(15).max(200).messages({
      'number.valid': 'The age must be a number',
      'number.max': 'The age must be maximal 200 years old',
      'number.min': 'The age must be a minimal 15 years old',
      'number.required': 'This is required'
    }),
    image: Joi.string().uri().min(5).messages({
      'string.uri': 'Invalid format image'
    }),
    gender: Joi.string().valid('MALE', 'FEMALE').required().messages({
      'string.valid': "Gender must be equal 'MALE' or 'FEMALE'"
    })
  })
};
