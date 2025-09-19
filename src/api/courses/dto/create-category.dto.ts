import { IsString, IsNotEmpty, IsInt, IsEmpty } from 'class-validator';

export class CreateCategoryDto {
  @IsInt()
  @IsNotEmpty()
  subCategoryId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  count: number;

  @IsString()
  @IsEmpty()
  icon?: string;
}
