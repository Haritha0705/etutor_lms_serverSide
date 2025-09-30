import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateSubCategoryDto {
  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
