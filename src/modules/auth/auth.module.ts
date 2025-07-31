import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { GoogleAuthService } from '@/modules/auth/google-auth.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { GoogleStrategy } from '@/modules/auth/passport/google.strategy';
import { JwtStrategy } from '@/modules/auth/passport/jwt.strategy';
import { SessionModule } from '@/modules/session/session.module';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    JwtModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SessionModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleAuthService,
    JwtStrategy,
    GoogleStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
