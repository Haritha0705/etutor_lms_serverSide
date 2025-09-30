import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateToolDto {
  @IsInt()
  @IsNotEmpty()
  subCategoryId: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
