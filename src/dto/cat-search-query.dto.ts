import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CatSearchQueryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  q!: string;
}
