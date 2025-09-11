import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString({ each: true })
  @IsNotEmpty()
  answers: string[];

  @IsInt()
  @IsNotEmpty()
  courseId: number;

  @IsInt()
  @IsNotEmpty()
  instructorId: number;
}
