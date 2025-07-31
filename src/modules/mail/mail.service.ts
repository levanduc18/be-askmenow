// mail.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

import { CONFIG_KEYS } from '@/common/constants/config-keys.const';
import { AppConfig } from '@/config/types/app-config.interface';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendVerificationEmail(to: string, token: string) {
    const appConfig: AppConfig = this.configService.get<AppConfig>(CONFIG_KEYS.APP, {
      infer: true,
    });
    await this.mailerService.sendMail({
      to,
      subject: 'Verify your email',
      template: 'verify-email',
      context: {
        verifyUrl: `${appConfig.webUrl}/auth/verify-email?token=${token}`,
      },
    });
  }
}
