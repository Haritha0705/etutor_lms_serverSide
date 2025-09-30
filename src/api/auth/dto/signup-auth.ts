import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  MinLength,
} from 'class-validator';
import { Role } from '../../../enum/role.enum';

export class SignupAuthDto {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  username: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(Role, { message: 'Invalid role' })
  role: Role;
}
