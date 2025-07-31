import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Session } from '@prisma/client';

import { CONFIG_KEYS } from '@/common/constants/config-keys.const';
import { AuthConfig } from '@/config/types/auth-config.interface';
import { PrismaService } from '@/modules/prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Save refresh token in db service.
   * @param {string} userId - user identifier.
   * @param {string} signatureHash - hashed signature.
   * @returns
   */
  async save(userId: string, signatureHash: string) {
    const authConfig: AuthConfig = this.configService.get<AuthConfig>(CONFIG_KEYS.AUTH, {
      infer: true,
    });
    const expiresAt = new Date(
      Date.now() + authConfig.jwtRefreshTokenExpireDay * 24 * 60 * 60 * 1000,
    );

    await this.prisma.session.create({
      data: {
        userId,
        signatureHash,
        expiresAt,
      },
    });
  }

  /**
   * Validate refresh token is valid or not service.
   * @param {string} signatureHash - hashed signature.
   * @returns
   */
  async validate(signatureHash: string): Promise<Session | null> {
    return await this.prisma.session.findFirst({
      where: {
        signatureHash,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });
  }

  /**
   * Find refresh token by signature.
   * @param {string} signatureHash - hashed signature.
   * @returns
   */
  async findBySignature(signatureHash: string): Promise<Session | null> {
    return await this.prisma.session.findFirst({
      where: { signatureHash },
    });
  }

  /**
   * Remove refresh token by signature.
   * @param {string} userId - user identifier.
   * @param {string} signatureHash - hashed signature.
   */
  async removeBySignature(userId: string, signatureHash: string) {
    await this.prisma.session.deleteMany({
      where: { userId, signatureHash },
    });
  }

  /**
   * Remove refresh token by user identifier.
   * @param {string} userId - user identifier.
   */
  async removeByUserId(userId: string) {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  /**
   * Revoke token by it value service.
   *  @param {string} signatureHash - hashed signature.
   */
  async revokeByToken(signatureHash: string) {
    await this.prisma.session.updateMany({
      where: {
        signatureHash,
      },
      data: {
        isRevoked: true,
      },
    });
  }

  /**
   * Revoke all tokens of the given user service.
   * @param {string} userId - user identifier.
   */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        userId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });
  }
}
