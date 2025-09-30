import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateQuizSubmissionDto {
  @IsInt()
  @IsNotEmpty()
  answer: number;

  @IsInt()
  @IsNotEmpty()
  studentId: number;

  @IsInt()
  @IsNotEmpty()
  quizId: number;
}
