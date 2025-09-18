import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsOptional,
  IsEnum,
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

  @IsEnum(Tool)
  @IsNotEmpty()
  tools: Tool;

  @IsEnum(Category)
  @IsNotEmpty()
  category: Category;

  @IsEnum(SubCategory)
  @IsNotEmpty()
  subCategory: SubCategory;

  @IsOptional()
  @IsString()
  categoryIcon?: string;
}
