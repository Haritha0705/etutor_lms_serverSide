import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PrismaModule } from '../../config/prisma/prisma.module';
import { EnrollmentsService } from './enrollments.service';
import { LessonsService } from './lessons.service';
import { ReviewService } from './review.service';
import { QuizzesService } from './quizzes.service';
import { AssignmentsService } from './assignments.service';

@Module({
  imports: [PrismaModule],
  controllers: [CoursesController],
  providers: [
    CoursesService,
    EnrollmentsService,
    LessonsService,
    ReviewService,
    QuizzesService,
    AssignmentsService,
  ],
})
export class CoursesModule {}
