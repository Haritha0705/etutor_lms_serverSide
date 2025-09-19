import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PrismaModule } from '../../config/prisma/prisma.module';
import { EnrollmentsService } from './enrollments.service';
import { LessonsService } from './lessons.service';
import { ReviewService } from './review.service';
import { QuizzesService } from './quizzes.service';
import { AssignmentsService } from './assignments.service';
import { CertificatesService } from './certificates.service';
import { FilterService } from './filter.service';
import { CategoryService } from './category.service';
import { SubCategoryService } from './subCategory.service';
import { ToolService } from './tool.service';

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
    CertificatesService,
    FilterService,
    CategoryService,
    SubCategoryService,
    ToolService,
  ],
})
export class CoursesModule {}
