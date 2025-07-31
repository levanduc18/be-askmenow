import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class UserQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Current page (>=1)' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Number of items per page (>=1)' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  limit?: number = 10;

  @ApiPropertyOptional({ example: true, description: 'Order by DESC or ASC' })
  @IsOptional()
  @Transform(({ value }) => value == 'true')
  desc?: boolean = true;

  @ApiPropertyOptional({ example: 'john', description: 'Find by email or full name' })
  @IsOptional()
  @IsString()
  search?: string;
}
