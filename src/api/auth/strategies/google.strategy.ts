import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { OAuthUserDto } from '../dto/oauth-user.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error('Google account has no email'), false);

      const user = await this.authService.validateGoogleUser({
        email,
        firstname: profile.name?.givenName ?? '',
        lastname: profile.name?.familyName ?? '',
        avatarUrl: profile.photos?.[0]?.value ?? '',
        googleId: profile.id,
      } as OAuthUserDto);

      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
}
