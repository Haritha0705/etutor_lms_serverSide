import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateJwt } from './dto/create-jwt.dto';

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
}
