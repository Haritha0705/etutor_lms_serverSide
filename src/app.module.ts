import { Module } from '@nestjs/common';
import { AuthModule } from './api/auth/auth.module';
import { CoursesModule } from './api/courses/courses.module';
import { UserModule } from './api/user/user.module';
import { PaymentsModule } from './api/payments/payments.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiCacheInterceptor } from './interceptor/api-cache/api-cache.interceptor';
import { CacheModule } from '@nestjs/cache-manager';
import { MessagesModule } from './api/messages/messages.module';
import { AnalyticsModule } from './api/analytics/analytics.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 1000 * 5,
      max: 100,
    }),
    AuthModule,
    PaymentsModule,
    UserModule,
    CoursesModule,
    MessagesModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiCacheInterceptor,
    },
  ],
})
export class AppModule {}
