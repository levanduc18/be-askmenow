import * as Joi from 'joi';

export const stripeValidation = {
  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().required(),
};
