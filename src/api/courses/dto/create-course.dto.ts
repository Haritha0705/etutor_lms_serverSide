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

export class CreateCourseDto {
  @IsInt()
  @IsNotEmpty()
  instructorId: number;

  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @IsInt()
  @IsNotEmpty()
  subCategoryId: number;

  @IsInt()
  @IsNotEmpty()
  toolId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsEnum(Duration)
  duration: Duration;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(Level)
  @IsNotEmpty()
  level: Level;

  @IsBoolean()
  @IsNotEmpty()
  isPaid: boolean;

  @IsOptional()
  @IsInt()
  price?: number;
}
