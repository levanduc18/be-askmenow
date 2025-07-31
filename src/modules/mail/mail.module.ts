import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { CONFIG_KEYS } from '@/common/constants/config-keys.const';
import { MailConfig } from '@/config/types/mail-config.interface';
import { MailService } from '@/modules/mail/mail.service';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const mailConfig: MailConfig = config.get<MailConfig>(CONFIG_KEYS.MAIL, { infer: true });
        return {
          transport: {
            host: mailConfig.host,
            port: mailConfig.port,
            secure: false,
            auth: {
              user: mailConfig.user,
              pass: mailConfig.pass,
            },
          },
          defaults: {
            from: mailConfig.from,
          },
          template: {
            dir: process.cwd() + '/src/modules/mail/templates/',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
