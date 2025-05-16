import Joi from 'joi';

const successResponse = Joi.object({
  title: Joi.string().required(),
  data: Joi.any().required(),
  status: Joi.number().required(),
  code: Joi.string().required(),
  meta: Joi.any().optional(),
});

const errorResponse = Joi.object({
  errors: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      detail: Joi.string().required(),
      status: Joi.number().required(),
      code: Joi.string().required(),
    }).label('ErrorDetail')
  ).required()
});

export default {
  status: {
    200: successResponse.label('SuccessResponse'),

    201: successResponse.label('CreatedResponse'),

    400: errorResponse.label('BadRequestResponse'),

    401: errorResponse.label('UnauthorizedResponse'),

    409: errorResponse.label('ConflictResponse'),

    403: errorResponse.label('ForbiddenResponse'),

    404: errorResponse.label('NotFoundResponse'),

    500: errorResponse.label('InternalServerErrorResponse'),
  }
};
