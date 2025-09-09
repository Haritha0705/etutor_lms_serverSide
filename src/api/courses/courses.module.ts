import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PrismaModule } from '../../config/prisma/prisma.module';
import { EnrollmentsController } from './enrollments.controller';
import { LessonsController } from './lessons.controller';
import { ReviewController } from './review.controller';
import { EnrollmentsService } from './enrollments.service';
import { LessonsService } from './lessons.service';
import { ReviewService } from './review.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CoursesController,
    EnrollmentsController,
    LessonsController,
    ReviewController,
  ],
  providers: [
    CoursesService,
    EnrollmentsService,
    LessonsService,
    ReviewService,
  ],
})
export class CoursesModule {}
