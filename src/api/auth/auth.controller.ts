import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupAuthDto } from './dto/signup-auth';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Public } from '../../decorator/public/public.decorator';
import { RefreshTokenDto } from '../../config/jwt/dto/RefreshTokenDto';
import { GoogleAuthGuard } from '../../guard/google-auth/google-auth.guard';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() userData: SignupAuthDto) {
    return this.authService.signup(userData);
  }

  @Post('login')
  login(@Body() userData: LoginAuthDto) {
    return this.authService.login(userData);
  }

  @Post('logout')
  logout(@Body() refreshToken: RefreshTokenDto) {
    return this.authService.logout(refreshToken.refreshToken);
  }

  @Post('refresh')
  refresh(@Body() refreshToken: RefreshTokenDto) {
    return this.authService.refresh(refreshToken.refreshToken);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req, @Res() res) {
    const user = (req as any).user;
    const response = await this.authService.loginWithGoogle(user);

    return res.json(response);
  }
}
