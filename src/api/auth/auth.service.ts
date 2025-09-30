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
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly DB: PrismaService,
    private readonly jwt: JwtAuthService,
    private readonly mailerService: MailerService,
  ) {}

  // API - User Register
  async signup(userData: SignupAuthDto) {
    const { username, email, password, role } = userData;

    if (!username || !email || !password || !role) {
      throw new BadRequestException('All fields are required.');
    }

    // Check if user already exists
    const existingUser = await this.DB.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      throw new ConflictException('User already exists.');
    }

    // Stronger password hashing
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      const result = await this.DB.$transaction(async (prisma) => {
        // 1. Create user
        const newUser = await prisma.user.create({
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

        // 2. Create corresponding profile
        if (newUser.role === 'student') {
          await prisma.studentProfile.create({
            data: {
              studentId: newUser.id,
              full_name: null,
              bio: null,
              profilePic: null,
              phone: null,
              address: null,
            },
          });
        } else if (newUser.role === 'instructor') {
          await prisma.instructorProfile.create({
            data: {
              instructorId: newUser.id,
              full_name: null,
              profilePic: null,
              bio: null,
              expertise: null,
            },
          });
        }

        // 3. Generate JWT tokens
        const payloadToSign: CreateJwt = {
          userId: newUser.id,
          email: newUser.email,
          role: newUser.role as Role,
        };

        const tokens = await this.jwt.generateToken(payloadToSign);

        // 4. Save refresh token
        await prisma.refreshToken.create({
          data: {
            token: tokens.refreshToken,
            userId: newUser.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });

        return { newUser, tokens };
      });

      return {
        success: true,
        status: 201,
        user: result.newUser,
        message: 'Check your email to verify your account.',
        token: result.tokens,
      };
    } catch (error) {
      console.error('User registration error:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
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
      if (!email || !password || !role)
        throw new BadRequestException('All fields are required.');

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
        } else throw new UnauthorizedException('Invalid admin credentials.');
      }

      //Handle regular user login
      const user = await this.DB.user.findUnique({ where: { email } });
      if (!user?.password) throw new ConflictException('User not found.');

      //Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        throw new UnauthorizedException('Invalid credentials.');

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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.log('Refresh token failed. Please try again later.', error);
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      )
        throw error;
      throw new InternalServerErrorException(
        'Refresh token failed. Please try again later.',
      );
    }
  }

  async validateGoogleUser(googleUser: OAuthUserDto) {
    try {
      const { email, firstname, lastname, avatarUrl, googleId } = googleUser;

      let user = await this.DB.user.findUnique({ where: { email } });

      if (user) {
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

      const result = await this.DB.$transaction(async (prisma) => {
        const newUser = await prisma.user.create({
          data: {
            email,
            username: email.split('@')[0],
            role: Role.STUDENT,
            password: null,
            googleId,
            firstName: firstname,
            lastName: lastname,
            avatarUrl,
          },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            avatarUrl: true,
          },
        });

        await prisma.studentProfile.create({
          data: {
            studentId: newUser.id,
            full_name:
              firstname && lastname
                ? `${firstname} ${lastname}`
                : newUser.username,
            profilePic: avatarUrl ?? null,
            bio: null,
            phone: null,
            address: null,
          },
        });

        const payload: CreateJwt = {
          userId: newUser.id,
          email: newUser.email,
          role: Role.STUDENT,
        };
        const tokens = await this.jwt.generateToken(payload);

        await prisma.refreshToken.create({
          data: {
            token: tokens.refreshToken,
            userId: newUser.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });

        return { newUser, tokens };
      });

      return result;
    } catch (error: unknown) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async loginWithGoogle(user: { id: number; email: string; role: Role }) {
    try {
      const payload: CreateJwt = {
        userId: user.id,
        email: user.email,
        role: Role.STUDENT,
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
    } catch (error: unknown) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async sendOtp(email: string): Promise<{ message: string }> {
    try {
      const user = await this.DB.user.findUnique({ where: { email } });
      if (!user) throw new BadRequestException('Email not registered');

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
    } catch (error: unknown) {
      console.error('sendOtp error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Could not send OTP');
    }
  }

  async verifyOtp(body: VerifyOtpDto): Promise<{ message: string }> {
    try {
      const record = await this.DB.otp.findFirst({
        where: { email: body.email, code: body.otp },
      });

      if (!record) throw new BadRequestException('Invalid or expired OTP');
      if (new Date() > record.expiresAt) return { message: 'OTP expired' };

      await this.DB.otp.delete({ where: { id: record.id } });

      await this.DB.user.update({
        where: { email: body.email },
        data: { isVerified: true },
      });

      return { message: 'Email verified successfully' };
    } catch (error: unknown) {
      console.error('generateResetToken error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Could not verify OTP');
    }
  }

  async ResetPasswordLink(email: string) {
    try {
      if (!email) throw new BadRequestException('Email is required');

      const user = await this.DB.user.findUnique({ where: { email } });
      if (!user) throw new BadRequestException('User not found');

      const token = randomBytes(32).toString('hex');
      console.log(token);
      const expiry = new Date(
        Date.now() +
          Number(process.env.RESET_PASSWORD_JWT_EXPIRE_IN) * 60 * 1000,
      );

      await this.DB.user.update({
        where: { email },
        data: {
          resetPasswordToken: token,
          resetPasswordTokenExpiry: expiry,
        },
      });

      const resetLink = `https://yourfrontend.com/reset-password?token=${token}&email=${email}`;

      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset',
        text: `Click here to reset your password: ${resetLink}`,
      });

      return { message: 'Reset email sent if user exists' };
    } catch (error: unknown) {
      console.error('generateResetToken error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Could not generate reset token');
    }
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    try {
      if (!email || !token || !newPassword) {
        throw new BadRequestException('All fields are required');
      }

      const user = await this.DB.user.findUnique({ where: { email } });

      if (
        !user ||
        !user.password ||
        user.resetPasswordToken !== token ||
        !user.resetPasswordTokenExpiry ||
        user.resetPasswordTokenExpiry < new Date()
      ) {
        throw new BadRequestException('Invalid or expired token');
      }

      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestException(
          'New password cannot be the same as the old password',
        );
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await this.DB.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordTokenExpiry: null,
        },
      });

      return { message: 'Password successfully reset' };
    } catch (error: unknown) {
      console.error('resetPassword error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Could not reset password');
    }
  }



  /** Request OTP before creating a user */
  async requestSignupOtp(
    userData: SignupAuthDto,
  ): Promise<{ message: string }> {
    const { username, email, password, role } = userData;

    if (!username || !email || !password || !role) {
      throw new BadRequestException('All fields are required.');
    }

    // Check if user/email already exists
    const existingUser = await this.DB.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) throw new ConflictException('User already exists.');

    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expireAt = new Date(Date.now() + 10 * 60 * 1000);

      const hashedPassword = await bcrypt.hash(password, 12);

      await this.DB.tempSignupOtp.upsert({
        where: { email },
        update: {
          username,
          password: hashedPassword,
          code: otp,
          expiresAt: expireAt,
          role,
        },
        create: {
          username,
          email,
          password: hashedPassword,
          code: otp,
          expiresAt: expireAt,
          role,
        },
      });

      // Send OTP via email
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify Your Email',
        html: `<p>Your OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`,
      });

      return { message: 'OTP sent to email' };
    } catch (err) {
      console.error('requestSignupOtp error:', err);
      throw new InternalServerErrorException(
        'Failed to send OTP. Try again later.',
      );
    }
  }

  /** Verify OTP and create the user */
  async verifySignupOtp(email: string, otp: string) {
    const temp = await this.DB.tempSignupOtp.findFirst({
      where: { email, code: otp },
    });

    if (!temp) throw new BadRequestException('Invalid or expired OTP');
    if (new Date() > temp.expiresAt)
      throw new BadRequestException('OTP expired');

    try {
      const result = await this.DB.$transaction(async (prisma) => {
        // 1️⃣ Create User
        const newUser = await prisma.user.create({
          data: {
            username: temp.username,
            email: temp.email,
            password: temp.password,
            role: temp.role,
            isVerified: true,
          },
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        });

        // 2️⃣ Create corresponding profile
        if (newUser.role === 'student') {
          await prisma.studentProfile.create({
            data: { studentId: newUser.id },
          });
        } else if (newUser.role === 'instructor') {
          await prisma.instructorProfile.create({
            data: { instructorId: newUser.id },
          });
        }

        // 3️⃣ Generate JWT
        const payload: CreateJwt = {
          userId: newUser.id,
          email: newUser.email,
          role: newUser.role as Role,
        };
        const tokens = await this.jwt.generateToken(payload);

        // 4️⃣ Save refresh token
        await prisma.refreshToken.create({
          data: {
            token: tokens.refreshToken,
            userId: newUser.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });

        // 5️⃣ Delete temp signup
        await prisma.tempSignupOtp.delete({ where: { id: temp.id } });

        return { newUser, tokens };
      });

      return {
        success: true,
        status: 201,
        user: result.newUser,
        message: 'Signup successful. You are now verified!',
        token: result.tokens,
      };
    } catch (err) {
      console.error('verifySignupOtp error:', err);
      throw new InternalServerErrorException(
        'Failed to verify OTP. Try again later.',
      );
    }
  }
}
