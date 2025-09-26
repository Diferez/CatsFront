import { IsNotEmpty, IsString } from 'class-validator';

export class BreedIdParamDto {
  @IsString()
  @IsNotEmpty()
  breed_id!: string;
}
