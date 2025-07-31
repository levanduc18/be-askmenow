import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Provider } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

import { CONFIG_KEYS } from '@/common/constants/config-keys.const';
import { AuthConfig } from '@/config/types/auth-config.interface';
import { getHashedSignature } from '@/helpers/constants/utils';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { TokenPayloadDto } from '@/modules/auth/dto/token-payload.dto';
import { GoogleAuthService } from '@/modules/auth/google-auth.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { SessionService } from '@/modules/session/session.service';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  /**
   * Register an account service.
   * @param {RegisterDto} registerDto - register dto.
   * @returns
   */
  async register(registerDto: RegisterDto) {
    return await this.userService.createCredentialUser(registerDto);
  }

  async loginWithGoogle(idToken: string, res: Response) {
    const googleUser = await this.googleAuthService.verifyIdToken(idToken);

    const existingUser = await this.userService.findByEmail(googleUser.email);

    if (existingUser) {
      if (!existingUser.googleId || existingUser.provider != Provider.CREDENTIALS)
        throw new UnauthorizedException(
          'This email is already registered using password. Please login using your credentials.',
        );
      return await this.generateTokens(existingUser, res);
    }

    const user = await this.prisma.user.create({
      data: {
        email: googleUser.email,
        fullName: googleUser.fullName,
        avatarUrl: googleUser.avatarUrl,
        googleId: googleUser.providerId,
        provider: Provider.GOOGLE,
      },
    });

    return await this.generateTokens(user, res);
  }

  /**
   * Login into system service.
   * @param {Response} res - response.
   * @param {LoginDto} loginDto - Login dto.
   * @returns
   */
  async login(res: Response, loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Account is registered by Google. Please login with Google.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (isMatch) {
      throw new UnauthorizedException('Incorrect password.');
    }

    return await this.generateTokens(user, res);
  }

  /**
   * Generate token for the given user information service.
   * @param {User} user - user information.
   * @returns
   */
  async generateTokens(user: TokenPayloadDto, res: Response) {
    const payload = { sub: user.id, email: user.email };

    const authConfig: AuthConfig = this.configService.get<AuthConfig>(CONFIG_KEYS.AUTH, {
      infer: true,
    });

    // Generate access token.
    const accessTokenJwtSignOptions: JwtSignOptions = {
      secret: authConfig.jwtSecret,
      expiresIn: `${authConfig.jwtAccessTokenExpireMin}m`,
    };
    const accessToken = this.jwtService.sign(payload, accessTokenJwtSignOptions);

    // Generate refresh token.
    const refreshTokenJwtSignOptions: JwtSignOptions = {
      secret: authConfig.jwtSecret,
      expiresIn: `${authConfig.jwtRefreshTokenExpireDay}d`,
    };

    const refreshToken = this.jwtService.sign(payload, refreshTokenJwtSignOptions);

    const signatureHash = getHashedSignature(refreshToken);
    await this.sessionService.save(user.id, signatureHash);

    // Set refresh token in client cookie.
    res.cookie('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: authConfig.jwtRefreshTokenExpireDay * 24 * 60 * 60 * 1000,
    });

    // Return access token to client.
    return { accessToken };
  }

  /**
   * Refresh token.
   * @param {Response} res - response.
   * @param {string} refreshToken - Refresh token value.
   * @returns
   */
  async refresh(res: Response, refreshToken: string) {
    const signatureHash = getHashedSignature(refreshToken);
    const validToken = await this.sessionService.validate(signatureHash);
    if (validToken == null) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const user = await this.userService.findById(validToken.userId);
    if (!user) throw new UnauthorizedException('User not found.');

    return await this.generateTokens(user, res);
  }

  async logout(res: Response, refreshToken: string) {
    const payload = this.jwtService.decode(refreshToken);
    if (!payload?.sub) throw new UnauthorizedException('Invalid refresh token');

    const signatureHash = getHashedSignature(refreshToken);
    await this.sessionService.removeBySignature(payload?.sub, signatureHash);
    res.clearCookie('refreshToken');
  }
}
