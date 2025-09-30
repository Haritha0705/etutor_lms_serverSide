import {
  IsOptional,
  IsString,
  IsInt,
  IsPhoneNumber,
  IsDate,
} from 'class-validator';

export class StudentProfileDto {
  @IsInt()
  id: number;

  @IsInt()
  studentId: number;

  @IsOptional()
  @IsString()
  profilePic: string | null;

  @IsOptional()
  @IsString()
  full_name: string | null;

  @IsOptional()
  @IsString()
  bio: string | null;

  @IsOptional()
  @IsPhoneNumber()
  phone: string | null;

  @IsOptional()
  @IsString()
  address: string | null;

  @IsDate()
  updatedAt: Date;
}
