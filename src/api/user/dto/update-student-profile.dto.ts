import { PartialType } from '@nestjs/mapped-types';
import { StudentProfileDto } from './student-profile.dto';

export class UpdateStudentProfileDto extends PartialType(StudentProfileDto) {}
