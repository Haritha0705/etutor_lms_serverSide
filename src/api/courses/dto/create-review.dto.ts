import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsInt()
  @IsNotEmpty()
  studentId: number;

  @IsInt()
  @IsNotEmpty()
  courseId: number;
}
