import { PartialType } from '@nestjs/mapped-types';
import { SignupAuthDto } from './signup-auth';

export class UpdateAuthDto extends PartialType(SignupAuthDto) {}
