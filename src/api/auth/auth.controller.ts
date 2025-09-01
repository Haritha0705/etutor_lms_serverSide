import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupAuthDto } from './dto/signup-auth';
import { LoginAuthDto } from './dto/login-auth.dto';

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
}
