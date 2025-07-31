import * as Joi from 'joi';

export const mailValidation = {
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_FROM: Joi.string().default('AskMeNow System'),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
};
