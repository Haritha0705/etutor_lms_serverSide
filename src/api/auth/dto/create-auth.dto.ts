import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  MinLength,
} from 'class-validator';
import { Role } from '../../../enum/role.enum';

export class CreateAuthDto {
  @IsNotEmpty() @IsString() username: string;
  @IsNotEmpty() @IsEmail() email: string;
  @IsNotEmpty() @IsString() @MinLength(8) password: string;
  @IsNotEmpty() @IsEnum(Role) role: Role;
}
