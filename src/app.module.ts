import { Module } from '@nestjs/common';
import { AuthModule } from './api/auth/auth.module';
import { CoursesModule } from './api/courses/courses.module';
import { EnrollmentsModule } from './api/enrollments/enrollments.module';
import { UserModule } from './api/user/user.module';
import { PaymentsModule } from './api/payments/payments.module';
import { LessonsModule } from './api/lessons/lessons.module';

@Module({
  imports: [
    AuthModule,
    LessonsModule,
    PaymentsModule,
    UserModule,
    EnrollmentsModule,
    CoursesModule,
  ],
})
export class AppModule {}
