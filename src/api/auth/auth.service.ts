import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupAuthDto } from './dto/signup-auth';
import { PrismaService } from '../../config/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtAuthService } from '../../config/jwt/jwt.service';
import { CreateJwt } from '../../config/jwt/dto/create-jwt.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Role } from '../../enum/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly DB: PrismaService,
    private readonly jwt: JwtAuthService,
  ) {}

  //API - User Register
  async signup(userData: SignupAuthDto) {
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

  //API - User login
  async login(userData: LoginAuthDto) {
    const { email, password, role } = userData;

    try {
      //Validate fields
      if (!email || !password || !role) {
        throw new BadRequestException('All fields are required.');
      }

      let tokenPayload: CreateJwt;

      //Handle admin login
      if (role === Role.ADMIN) {
        if (
          email === process.env.ADMIN_EMAIL &&
          password === process.env.ADMIN_PASSWORD
        ) {
          tokenPayload = { email: email, role: role };
          const accessToken = await this.jwt.generateToken(tokenPayload);
          return {
            success: true,
            status: 200,
            message: `${role} has been logged in.`,
            accessToken,
          };
        } else {
          throw new UnauthorizedException('Invalid admin credentials.');
        }
      }

      //Handle regular user login
      const user = await this.DB.user.findUnique({ where: { email } });
      if (!user) {
        throw new ConflictException('User not found.');
      }

      //Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials.');
      }

      //Generate JWT
      tokenPayload = { email: email, role: role };
      const accessToken = await this.jwt.generateToken(tokenPayload);

      return {
        success: true,
        status: 200,
        message: `${role} has been logged in.`,
        accessToken,
      };
    } catch (error: unknown) {
      // Structured logging
      console.log('Login failed', { error, userData });

      // Handle known errors
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      // Fallback for unexpected errors
      throw new InternalServerErrorException(
        'Login failed. Please try again later.',
      );
    }
  }
}
