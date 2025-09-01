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

  async generateToken(payload: CreateJwt): Promise<string> {
    try {
      return await this.jwt.signAsync(payload);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async verifyToken(token: string, roles?: Role[]): Promise<boolean> {
    try {
      const payload = await this.jwt.verifyAsync<CreateJwt>(token);

      if (roles && !roles.includes(payload.role)) {
        throw new ForbiddenException(
          'You are not authorized to access this route',
        );
      }

      return true;
    } catch (err: any) {
      if (err?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (err instanceof HttpException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or malformed token');
    }
  }
}
