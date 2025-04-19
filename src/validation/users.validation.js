import Joi from 'joi';

export default {
  filterById: Joi.object({
    id: Joi.string()
      .length(25)
      .required()
      .description('The unique identifier for the user')
      .messages({
        'string.length': 'invalid length id must be equal 25',
        'any.required': 'this id is required'
      })
  }).label('FilterByIdQuery'),
  pagination: Joi.object({
    page: Joi.number()
      .min(1)
      .required()
      .description('The page number for pagination, starting from 1')
      .messages({
        'number.min': 'number page must be greater than 0',
        'any.required': 'this page is required'
      })
      .default(1),
    size: Joi.number()
      .min(1)
      .description('The number of items per page for pagination')
      .messages({
        'number.min': 'number page must be greater than 0'
      })
      .default(10)
  }).label('PaginationQuery'),

  cursorPaginate: Joi.object({
    size: Joi.number()
      .min(1)
      .default(10)
      .description('The number of items to fetch in cursor pagination')
      .messages({
        'number.min': 'must have at least one'
      }),
    before: Joi.string()
      .length(25)
      .description('The cursor ID to retrieve items before a specific record')
      .messages({
        'string.length': 'invalid length id must be equal 25'
      }),
    after: Joi.string()
      .length(25)
      .description('The cursor ID to retrieve items after a specific record')
      .messages({
        'string.length': 'invalid length id must be equal 25'
      })
  }).label('CursorPaginationQuery'),

  payloadToken: Joi.object({
    id: Joi.string()
      .length(25)
      .required()
      .description('The unique identifier for the user')
      .messages({
        'string.length': 'invalid length id must be equal 25',
        'any.required': 'this id is required'
      }),
    email: Joi.string()
      .required()
      .email()
      .max(255)
      .description('The email address of the user')
      .messages({
        'string.max': 'Must have max 255 characters',
        'any.required': 'this email is required',
        'string.email': 'Invalid format email'
      }),
    role: Joi.string()
      .valid('ADMIN', 'USER')
      .required()
      .description('The role assigned to the user')
      .messages({
        'any.only': "The role must be equal 'ADMIN', 'USER'",
        'any.required': 'this role is required'
      })
  }).label('UserPayloadToken'),

  filterByEmail: Joi.object({
    email: Joi.string()
      .required()
      .email()
      .max(255)
      .description('Filter data by user email')
      .messages({
        'string.max': 'Must have max 255 characters',
        'any.required': 'this email is required',
        'string.email': 'Invalid format email'
      })
  }).label('FilterByEmailQuery'),

  register: Joi.object({
    username: Joi.string()
      .required()
      .max(100)
      .min(3)
      .description('The username to register the user with')
      .messages({
        'string.min': 'Must have at least 3 characters',
        'string.max': 'Must have max 255 characters',
        'any.required': 'this username is required'
      }),
    email: Joi.string()
      .required()
      .email()
      .max(255)
      .description('The email address for the user')
      .messages({
        'string.max': 'Must have max 255 characters',
        'any.required': 'this email is required',
        'string.email': 'Invalid format email'
      }),
    password: Joi.string()
      .required()
      .min(8)
      .max(255)
      .description('The password to secure the user account')
      .messages({
        'string.min': 'Must have at least 8 characters',
        'string.max': 'Must have max 255 characters',
        'any.required': 'this password is required'
      }),
    role: Joi.string()
      .valid('ADMIN', 'USER')
      .default('USER')
      .description('The role to assign to the user')
      .messages({
        'any.only': "The role must be equal 'ADMIN', 'USER'"
      }),
    image: Joi.string()
      .uri()
      .min(5)
      .description('The profile image URL of the user')
      .messages({
        'string.uri': 'Invalid format image'
      })
      .default(`${process.env.FRONT_END_BASE_URL}/public/profile/guest.png`),
    gender: Joi.string()
      .valid('MALE', 'FEMALE')
      .required()
      .description('The gender of the user')
      .messages({
        'any.only': "Gender must be equal 'MALE' or 'FEMALE'",
        'any.required': 'this gender is required'
      })
  }).label('UserRegisterBody'),

  login: Joi.object({
    email: Joi.string()
      .required()
      .email()
      .max(255)
      .description('The email address for login')
      .messages({
        'string.max': 'Must have max 255 characters',
        'any.required': 'this email is required',
        'string.email': 'Invalid format email'
      }),
    password: Joi.string()
      .required()
      .min(8)
      .max(255)
      .description('The password for login')
      .messages({
        'string.min': 'Must have at least 8 characters',
        'string.max': 'Must have max 255 characters',
        'any.required': 'this password is required'
      })
  }).label('UserLoginBody'),

  update: Joi.object({
    username: Joi.string()
      .required()
      .max(100)
      .min(3)
      .description('Updated username of the user')
      .messages({
        'string.min': 'Must have at least 3 characters',
        'string.max': 'Must have max 255 characters',
        'any.required': 'this username is required'
      }),
    password: Joi.string()
      .required()
      .min(8)
      .max(255)
      .description('Updated password for the user account')
      .messages({
        'string.min': 'Must have at least 8 characters',
        'string.max': 'Must have max 255 characters',
        'any.required': 'this password is required'
      }),
    image: Joi.string()
      .uri()
      .min(5)
      .description('Updated profile image URL of the user')
      .messages({
        'string.uri': 'Invalid format image'
      }),
    gender: Joi.string()
      .valid('MALE', 'FEMALE')
      .required()
      .description('Updated gender of the user')
      .messages({
        'any.only': "Gender must be equal 'MALE' or 'FEMALE'",
        'any.required': 'this gender is required'
      })
  }).label('UserUpdateBody'),
  refreshToken: Joi.object({
    refreshToken: Joi.string()
      .required()
      .description('The refresh token to create access token again')
      .messages({
        'any.required': 'this email is required',
      }),
  }).label('UserRefreshTokenBody'),
};
