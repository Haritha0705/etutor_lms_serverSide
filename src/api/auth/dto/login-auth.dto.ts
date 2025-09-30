import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  MinLength,
} from 'class-validator';
import { Role } from '../../../enum/role.enum';

export class LoginAuthDto {
  @IsNotEmpty() @IsEmail() email: string;
  @IsNotEmpty() @IsString() @MinLength(8) password: string;
  @IsNotEmpty() @IsEnum(Role) role: Role;
}
