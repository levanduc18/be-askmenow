import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';

import { CONFIG_KEYS } from '@/common/constants/config-keys.const';
import { AuthConfig } from '@/config/types/auth-config.interface';
import { AuthService } from '@/modules/auth/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    const authConfig: AuthConfig = configService.get<AuthConfig>(CONFIG_KEYS.AUTH, { infer: true });
    super({
      clientID: authConfig.googleClientId,
      clientSecret: authConfig.googleClientSecret,
      callbackURL: authConfig.googleCallbackUrl,
      scope: ['email', 'profile'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { id, emails, displayName, photos } = profile;

    return {
      provider: 'google',
      providerId: id,
      email: emails?.[0].value,
      name: displayName,
      avatarUrl: photos?.[0]?.value,
    };
  }
}
