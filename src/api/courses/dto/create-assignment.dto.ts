import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsNotEmpty()
  courseId: number;

  @IsInt()
  @IsNotEmpty()
  instructorId: number;
}
