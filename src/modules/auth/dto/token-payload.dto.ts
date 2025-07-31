import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class TokenPayloadDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The valid email address of the user',
  })
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    example: 'strongpassword123',
    description: 'The password of the account',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
