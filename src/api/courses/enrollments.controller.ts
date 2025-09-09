import { Controller, Post, Body, Delete } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CourseEnrollmentDto } from './dto/create-enrollment.dto';

@Controller('courses')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post('enroll')
  enroll(@Body() dto: CourseEnrollmentDto) {
    return this.enrollmentsService.enroll(dto);
  }

  @Delete('unenroll')
  unenroll(@Body() dto: CourseEnrollmentDto) {
    return this.enrollmentsService.unenroll(dto);
  }
}
