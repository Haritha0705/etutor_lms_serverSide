import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateJwt } from './dto/create-jwt.dto';
import { Role } from '../../enum/role.enum';

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwt: JwtService) {}

  async generateToken(
    payload: CreateJwt,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
      const accessToken = await this.jwt.signAsync(tokenPayload, {
        secret: process.env.ACCESS_JWT_SECRET,
        expiresIn: process.env.ACCESS_JWT_EXPIRE_IN,
      });
      const refreshToken = await this.jwt.signAsync(tokenPayload, {
        secret: process.env.REFRESH_JWT_SECRET,
        expiresIn: process.env.REFRESH_JWT_EXPIRE_IN,
      });
      return { accessToken, refreshToken };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async verifyAccessToken(accessToken: string, roles?: Role[]) {
    try {
      const payload = await this.jwt.verifyAsync<CreateJwt>(accessToken, {
        secret: process.env.ACCESS_JWT_SECRET,
      });

      if (roles && !roles.includes(payload.role)) {
        throw new ForbiddenException(
          'You are not authorized to access this route',
        );
      }
      return payload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token expired');
      }
      if (err instanceof HttpException) throw err;
      throw new UnauthorizedException('Access token invalid');
    }
  }

  async verifyRefreshToken(refreshToken: string, roles?: Role[]) {
    try {
      const payload = await this.jwt.verifyAsync<CreateJwt>(refreshToken, {
        secret: process.env.REFRESH_JWT_SECRET,
      });

      if (roles && !roles.includes(payload.role)) {
        throw new ForbiddenException(
          'You are not authorized to access this route',
        );
      }
      return payload;
    } catch (err: any) {
      console.log('Refresh Token Error:', err);
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      }
      if (err instanceof HttpException) {
        throw err;
      }
      throw new UnauthorizedException('Refresh token invalid');
    }
  }
}
