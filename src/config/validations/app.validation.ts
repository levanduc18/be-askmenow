import * as Joi from 'joi';

export const appValidation = {
  PORT: Joi.number().default(3000),
  WEB_URL: Joi.string().default('http://localhost:8080'),
};
