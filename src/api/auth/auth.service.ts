import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from '../../config/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtAuthService } from '../../config/jwt/jwt.service';
import { CreateJwt } from '../../config/jwt/dto/create-jwt.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly DB: PrismaService,
    private readonly jwt: JwtAuthService,
  ) {}

  //API - User Register
  async register(userData: CreateAuthDto) {
    try {
      // Check required fields
      const { username, email, password, role } = userData;
      if (!username || !email || !password || !role) {
        throw new BadRequestException('All fields are required.');
      }

      // Check if user already exists
      const existingUser = await this.DB.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (existingUser) {
        throw new ConflictException(`${role} already exists.`);
      }

      // Stronger password hashing with dynamic salt rounds
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user in DB
      const newUser = await this.DB.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role,
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
        },
      });

      const payload = {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      };

      const accessToken = await this.jwt.generateToken(payload as CreateJwt);

      return {
        success: true,
        status: 201,
        user: newUser,
        message: 'Check your email to verify your account.',
        accessToken,
      };
    } catch (error: unknown) {
      console.error('User registration error:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      // Fallback for unexpected errors
      throw new InternalServerErrorException(
        'Failed to register user. Please try again later.',
      );
    }
  }

  // findAll() {
  //   return `This action returns all auth`;
  // }
  //
  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }
  //
  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
