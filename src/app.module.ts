import { Module } from '@nestjs/common';
import { AuthModule } from './api/auth/auth.module';
import { CoursesModule } from './api/courses/courses.module';
import { EnrollmentsModule } from './api/enrollments/enrollments.module';
import { UserModule } from './api/user/user.module';
import { PaymentsModule } from './api/payments/payments.module';
import { LessonsModule } from './api/lessons/lessons.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiCacheInterceptor } from './interceptor/api-cache/api-cache.interceptor';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 1000 * 5,
      max: 100,
    }),
    AuthModule,
    LessonsModule,
    PaymentsModule,
    UserModule,
    EnrollmentsModule,
    CoursesModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiCacheInterceptor,
    },
  ],
})
export class AppModule {}
