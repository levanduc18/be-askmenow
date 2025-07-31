import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The valid email address of the user',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'strongpassword123',
    description: 'The password of the account',
    minLength: 6,
  })
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  @IsOptional()
  fullName: string;
}
