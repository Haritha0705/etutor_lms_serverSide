import { IsEmail, IsOptional, IsString } from 'class-validator';

export class OAuthUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  googleId?: string;
}
