import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ImagesByBreedQueryDto {
  @IsString()
  @IsNotEmpty()
  breed_id!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(20)
  limit?: number;
}
