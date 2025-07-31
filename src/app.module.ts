import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import * as Joi from 'joi';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import config from '@/config';
import { envValidation } from '@/config/validations';
import { AuthModule } from '@/modules/auth/auth.module';
import { LoggerModule } from '@/modules/logger/logger.module';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { SessionModule } from '@/modules/session/session.module';
import { StripeModule } from '@/modules/stripe/stripe.module';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
      validationSchema: Joi.object(envValidation),
    }),
    AuthModule,
    LoggerModule,
    PrismaModule,
    UserModule,
    SessionModule,
    StripeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
