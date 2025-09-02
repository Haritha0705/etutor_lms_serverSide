import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthService } from '../../config/jwt/jwt.service';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PUBLIC_DEC_KEY } from '../../decorator/public/public.decorator';
import { ROLE_DEC_KEY } from '../../decorator/roles/roles.decorator';
import { Role } from '../../enum/role.enum';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtAuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_DEC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const roles = this.reflector.getAllAndOverride<Role[]>(ROLE_DEC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request: Request & { user?: any } = context
      .switchToHttp()
      .getRequest();
    const tokenString = request.headers.authorization;
    const token = tokenString?.split(' ')[1];

    if (!token) return false;

    try {
      const payload = await this.jwtService.verifyAccessToken(token, roles);
      request.user = payload;
      return true;
    } catch (err) {
      return false;
    }
  }
}
