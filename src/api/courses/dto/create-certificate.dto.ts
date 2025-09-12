import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateCertificateDto {
  @IsInt()
  @IsNotEmpty()
  studentId: number;

  @IsInt()
  @IsNotEmpty()
  courseId: number;

  @IsString()
  @IsNotEmpty()
  studentName: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}
