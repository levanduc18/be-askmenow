import { appValidation } from '@/config/validations/app.validation';
import { authValidation } from '@/config/validations/auth.validation';
import { databaseValidation } from '@/config/validations/database.validation';
import { mailValidation } from '@/config/validations/mail.validation';
import { stripeValidation } from '@/config/validations/stripe.validation';

export const envValidation = {
  ...appValidation,
  ...authValidation,
  ...mailValidation,
  ...stripeValidation,
  ...databaseValidation,
};
