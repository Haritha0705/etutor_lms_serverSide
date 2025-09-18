import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsOptional,
  IsEnum,
  ArrayNotEmpty,
} from 'class-validator';
import { Level } from '../../../enum/level.enum';
import { Duration } from '../../../enum/duration.enum';
import { Tool } from '../../../enum/tools.enum';
import { Category } from '../../../enum/category.enum';
import { SubCategory } from '../../../enum/subCategory.enum';

export class CreateCourseDto {
  @IsInt()
  @IsNotEmpty()
  instructorId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsEnum(Duration)
  description: Duration;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsEnum(Level)
  @IsNotEmpty()
  level: Level;

  @IsBoolean()
  @IsNotEmpty()
  isPaid: boolean;

  @IsOptional()
  @IsInt()
  price?: number;

  @IsEnum(Category)
  @IsNotEmpty()
  category: Category;

  @IsOptional()
  @IsString()
  categoryIcon?: string;

  @IsEnum(SubCategory)
  @IsNotEmpty()
  subCategory: SubCategory;

  @IsNotEmpty()
  @ArrayNotEmpty()
  @IsEnum(Tool, { each: true })
  tools: Tool[];
}
