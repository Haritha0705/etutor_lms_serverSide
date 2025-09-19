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

  @IsString()
  @IsNotEmpty()
  categoryName: string;

  @IsString()
  @IsNotEmpty()
  subCategoryName: string;

  @IsString()
  @IsNotEmpty()
  toolName: string;

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
