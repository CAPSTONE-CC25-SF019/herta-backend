import Joi from 'joi';

export default {
  cursorPaginate: Joi.object({
    size: Joi.number().min(1).default(10).messages({
      'number.min': 'must have at least one'
    }),
    before: Joi.object({
      id: Joi.string().length(25).messages({
        'string.length': 'invalid length id must be equal 25'
      })
    }),
    after: Joi.object({
      id: Joi.string().length(25).messages({
        'string.length': 'invalid length id must be equal 25'
      })
    })
  }),

  payloadToken: Joi.object({
    id: Joi.string().length(25).required().messages({
      'string.length': 'invalid length id must be equal 25',
      'string.required': 'Invalid payload'
    }),
    email: Joi.string().required().email().max(255).messages({
      'string.max': 'Must have max 255 characters',
      'string.required': 'This is required',
      'email.invalid': 'Invalid format email'
    }),
    role: Joi.string().valid('ADMIN', 'USER').required().messages({
      'string.valid': "The role must be equal 'ADMIN', 'USER'",
      'string.required': 'This is required'
    })
  }),

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
    role: Joi.string().valid('ADMIN', 'USER').default('USER').messages({
      'string.valid': "The role must be equal 'ADMIN', 'USER'"
    }),
    age: Joi.number().required().min(15).max(200).messages({
      'number.valid': 'The age must be a number',
      'number.max': 'The age must be maximal 200 years old',
      'number.min': 'The age must be a minimal 15 years old',
      'number.required': 'This is required'
    }),
    image: Joi.string()
      .uri()
      .min(5)
      .messages({
        'string.uri': 'Invalid format image'
      })
      .default(`${process.env.FRONT_END_BASE_URL}/public/profile/guest.png`),
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
    password: Joi.string().required().min(8).max(255).messages({
      'string.min': 'Must have at least 8 characters',
      'string.max': 'Must have max 255 characters',
      'string.required': 'This is required'
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
