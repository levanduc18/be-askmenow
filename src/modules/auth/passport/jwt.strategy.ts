import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';

import { CONFIG_KEYS } from '@/common/constants/config-keys.const';
import { AuthConfig } from '@/config/types/auth-config.interface';
import { UserInToken } from '@/modules/auth/passport/interfaces/user-in-token.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const authConfig: AuthConfig = configService.get<AuthConfig>(CONFIG_KEYS.AUTH, { infer: true });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwtSecret,
    } as StrategyOptionsWithRequest);
  }

  validate(payload: UserInToken) {
    return { id: payload.sub, email: payload.email };
  }
}
