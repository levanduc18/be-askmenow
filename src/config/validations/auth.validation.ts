import * as Joi from 'joi';

export const authValidation = {
  JWT_SECRET: Joi.string().required(),
  JWT_AT_EXPIRE_MIN: Joi.number().default(30),
  JWT_RT_EXPIRE_DAY: Joi.number().default(7),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().required(),
};
