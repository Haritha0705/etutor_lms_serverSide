import { PartialType } from '@nestjs/mapped-types';
import { InstructorProfileDto } from './instructor-profile.dto';

export class UpdateInstructorProfileDto extends PartialType(
  InstructorProfileDto,
) {}
