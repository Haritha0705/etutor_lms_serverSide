import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupAuthDto } from './dto/signup-auth';
import { PrismaService } from '../../config/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtAuthService } from '../../config/jwt/jwt.service';
import { CreateJwt } from '../../config/jwt/dto/create-jwt.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Role } from '../../enum/role.enum';
import { OAuthUserDto } from './dto/oauth-user.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly DB: PrismaService,
    private readonly jwt: JwtAuthService,
    private readonly mailerService: MailerService,
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

      const payloadToSign: CreateJwt = {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role as Role,
      };

      const tokens = await this.jwt.generateToken(payloadToSign);

      // Save refresh token in DB
      await this.DB.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: newUser.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        success: true,
        status: 201,
        user: newUser,
        message: 'Check your email to verify your account.',
        token: tokens,
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

      let payloadToLogin: CreateJwt;

      //Handle admin login
      if (role === Role.ADMIN) {
        if (
          email === process.env.ADMIN_EMAIL &&
          password === process.env.ADMIN_PASSWORD
        ) {
          payloadToLogin = { userId: 0, email: email, role: Role.ADMIN };
          const tokens = await this.jwt.generateToken(payloadToLogin);
          return {
            success: true,
            status: 200,
            message: `${role} has been logged in.`,
            token: tokens,
          };
        } else {
          throw new UnauthorizedException('Invalid admin credentials.');
        }
      }

      //Handle regular user login
      const user = await this.DB.user.findUnique({ where: { email } });
      if (!user?.password) {
        throw new ConflictException('User not found.');
      }

      //Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials.');
      }

      //Generate JWT
      payloadToLogin = {
        userId: user.id,
        email: user.email,
        role: user.role as Role,
      };
      const tokens = await this.jwt.generateToken(payloadToLogin);

      // Save refresh token in DB
      await this.DB.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        success: true,
        status: 200,
        message: `${role} has been logged in.`,
        token: tokens,
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

  async logout(refreshToken: string) {
    try {
      //Validate input
      if (!refreshToken) {
        throw new BadRequestException('Refresh token is required.');
      }

      //Check if token exists
      const existingToken = await this.DB.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!existingToken) {
        throw new NotFoundException(
          'Refresh token not found or already invalidated',
        );
      }

      //Delete the token
      await this.DB.refreshToken.delete({
        where: { token: refreshToken },
      });

      //Return success response
      return {
        success: true,
        status: 200,
        message: 'Logged out successfully.',
      };
    } catch (error) {
      //Centralized error handling
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('Logout error:', error);
      throw new InternalServerErrorException(
        'Something went wrong while logging out. Please try again later.',
      );
    }
  }

  async refresh(refreshToken: string) {
    try {
      if (!refreshToken)
        throw new BadRequestException('Refresh token required');

      const tokenRecord = await this.DB.refreshToken.findUnique({
        where: { token: refreshToken },
      });
      if (!tokenRecord)
        throw new UnauthorizedException('Refresh token invalid');

      const payload = await this.jwt.verifyRefreshToken(refreshToken);

      // Generate new tokens
      const tokens = await this.jwt.generateToken(payload);

      // Save new refresh token in DB and delete old one
      await this.DB.refreshToken.delete({ where: { token: refreshToken } });
      await this.DB.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: payload.userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        success: true,
        status: 200,
        message: 'Tokens refreshed successfully',
        token: tokens,
      };
    } catch (e) {
      console.log('Refresh token failed. Please try again later.', e);
    }
  }

  async validateGoogleUser(googleUser: OAuthUserDto) {
    const { email, firstname, lastname, avatarUrl, googleId } = googleUser;

    let user = await this.DB.user.findUnique({ where: { email } });
    if (user) {
      // optional: update avatar or googleId if new
      if (!user.googleId || (avatarUrl && user.avatarUrl !== avatarUrl)) {
        user = await this.DB.user.update({
          where: { id: user.id },
          data: {
            googleId: googleId ?? undefined,
            avatarUrl: avatarUrl ?? undefined,
          },
        });
      }
      return user;
    }

    // Create minimal Google user
    user = await this.DB.user.create({
      data: {
        email,
        username: email.split('@')[0],
        role: Role.STUDENT,
        password: null,
        googleId: googleId ?? undefined,
        firstName: firstname ?? undefined,
        lastName: lastname ?? undefined,
        avatarUrl: avatarUrl ?? undefined,
      },
    });

    return user;
  }

  async loginWithGoogle(user: { id: number; email: string; role: Role }) {
    const payload: CreateJwt = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = await this.jwt.generateToken(payload);

    await this.DB.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const safeUser = await this.DB.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });

    return {
      success: true,
      status: 200,
      message: 'Logged in with Google.',
      user: safeUser,
      token: tokens,
    };
  }

  async sendOtp(email: string): Promise<{ message: string }> {
    const user = await this.DB.user.findUnique({ where: { email } });
    if (!user) return { message: 'Email not registered' };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expireAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.DB.otp.create({
      data: {
        email,
        code: otp,
        expiresAt: expireAt,
      },
    });

    await this.mailerService.sendMail({
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP code is <b>${otp}</b>. It will expire in 10 minutes.</p>`,
    });

    return { message: 'OTP sent to email' };
  }

  async verifyOtp(body: VerifyOtpDto): Promise<{ message: string }> {
    const record = await this.DB.otp.findFirst({
      where: { email: body.email, code: body.otp },
    });

    if (!record) return { message: 'Invalid or expired OTP' };
    if (new Date() > record.expiresAt) return { message: 'OTP expired' };

    await this.DB.otp.delete({ where: { id: record.id } });

    await this.DB.user.update({
      where: { email: body.email },
      data: { isVerified: true },
    });

    return { message: 'Email verified successfully' };
  }
}
