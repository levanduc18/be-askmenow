import { createHash, randomBytes } from 'crypto';

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { DateTime } from 'luxon';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { getHashPassword } from '@/helpers/constants/utils';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { MailService } from '@/modules/mail/mail.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { UserQueryDto } from '@/modules/user/dto/user-query.dto';
import { UserDto } from '@/modules/user/dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  /**
   * Create new user service.
   * @param {RegisterDto} registerDto - register dto.
   * @returns
   */
  async createCredentialUser(registerDto: RegisterDto): Promise<{ id: string }> {
    const { email, password, fullName } = registerDto;

    // Check email exists
    const userExists = await this.findByEmail(email);
    if (userExists != null) {
      throw new BadRequestException(`Email ${email} is already taken. Please use another mail.`);
    }

    const passwordHash = await getHashPassword(password);
    const user = await this.prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
      },
    });

    const rawToken = randomBytes(32).toString('hex');
    const hashed = createHash('sha256').update(rawToken).digest('hex');
    await this.prisma.emailVerificationToken.create({
      data: {
        token: hashed,
        userId: user.id,
        expiresAt: DateTime.utc().plus({ hours: 1 }).toJSDate(),
      },
    });

    // Send email to user to verify the account.
    await this.mailService.sendVerificationEmail(user.email, rawToken);

    return { id: user.id };
  }

  /**
   * Find user by its identifier.
   * @param {string} id  - user identifier.
   * @returns
   */
  async findById(id: string, isOmitPassword: boolean = true) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return isOmitPassword
      ? user
      : plainToInstance(UserDto, user, {
          excludeExtraneousValues: true,
        });
  }

  /**
   * Find user by its email.
   * @param {string} email - email of user.
   * @returns
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async findAll(query: UserQueryDto) {
    const { page = 1, limit = 10, desc = true, search } = query;
    const skip = page - 1;

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: desc ? 'desc' : 'asc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) =>
        plainToInstance(UserDto, user, {
          excludeExtraneousValues: true,
        }),
      ),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        sort: desc ? 'desc' : 'asc',
      },
    };
  }
}
