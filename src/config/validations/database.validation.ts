import * as Joi from 'joi';

export const databaseValidation = {
  DATABASE_URL: Joi.string().required(),
};
