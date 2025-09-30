import { IsOptional, IsString, IsInt, IsDate } from 'class-validator';

export class InstructorProfileDto {
  @IsInt()
  id: number;

  @IsInt()
  instructorId: number;

  @IsOptional()
  @IsString()
  full_name: string | null;

  @IsOptional()
  @IsString()
  bio: string | null;

  @IsOptional()
  @IsString()
  expertise: string | null;

  @IsOptional()
  @IsString()
  profilePic: string | null;

  @IsDate()
  updatedAt: Date;
}
