import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { CurrentUser } from '@/modules/auth/passport/current-user.decorator';
import { UserQueryDto } from '@/modules/user/dto/user-query.dto';
import { UserService } from '@/modules/user/user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the list of users (with pagination and search)' })
  @ApiOkResponse({
    description: 'The returned list of the users that are matched with the given condition.',
    schema: {
      example: {
        data: [
          {
            id: 'abc-uuid',
            email: 'user@example.com',
            name: 'John Doe',
            picture: 'abc.png',
            createdAt: '2025-07-07T10:00:00Z',
            updatedAt: '2025-07-07T10:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 50,
          totalPages: 5,
          sort: 'desc',
        },
      },
    },
  })
  async findAll(@Query() query: UserQueryDto) {
    return await this.userService.findAll(query);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return this.userService.findById(user.id);
  }
}
