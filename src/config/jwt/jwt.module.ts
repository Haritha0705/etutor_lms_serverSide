import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthService } from './jwt.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from '../../guard/jwtguard/jwtguard.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    JwtAuthService,
  ],
  exports: [JwtAuthService],
})
export class JwtAuthModule {}
