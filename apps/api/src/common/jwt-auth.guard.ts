import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from './public.decorator.js';

export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'pt-cas-jwt-access-secret-2026';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'pt-cas-jwt-refresh-secret-2026';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        success: false,
        message: 'Akses ditolak. Token otentikasi tidak ditemukan.',
        timestamp: new Date().toISOString(),
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException({
        success: false,
        message: 'Sesi login telah kedaluwarsa atau token tidak valid. Silakan gunakan refreshToken.',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
