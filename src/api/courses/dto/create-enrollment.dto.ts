import { IsInt, IsNotEmpty } from 'class-validator';

export class CourseEnrollmentDto {
  @IsInt()
  @IsNotEmpty()
  studentId: number;

  @IsInt()
  @IsNotEmpty()
  courseId: number;
}
