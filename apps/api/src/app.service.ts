import { Injectable } from '@nestjs/common';
import {
  ApiResponse,
  HashVerificationResult,
  ServerStatus,
  APP_CONFIG,
} from '@repo/shared';
import { PasswordService } from './common/password.service.js';

@Injectable()
export class AppService {
  constructor(private readonly passwordService: PasswordService) {}

  getHealth(): ApiResponse<ServerStatus> {
    return {
      success: true,
      message: 'Server operational',
      data: {
        status: 'ok',
        service: 'E-Commerce Ordering API',
        uptime: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV ?? 'development',
        timestamp: new Date().toISOString(),
        version: APP_CONFIG.apiVersion,
      },
      timestamp: new Date().toISOString(),
    };
  }

  getApiInfo(): ApiResponse<{
    name: string;
    company: string;
    version: string;
    orm: string;
  }> {
    return {
      success: true,
      message: 'Welcome to PT CAS Ordering API',
      data: {
        name: APP_CONFIG.appName,
        company: `${APP_CONFIG.company} (CAS)`,
        version: APP_CONFIG.apiVersion,
        orm: 'Drizzle ORM (PostgreSQL)',
      },
      timestamp: new Date().toISOString(),
    };
  }

  async verifyPassword(
    password: string,
    hashToCompare?: string,
  ): Promise<ApiResponse<HashVerificationResult>> {
    const hashed = hashToCompare ?? (await this.passwordService.hash(password));
    const matched = await this.passwordService.compare(password, hashed);
    return {
      success: true,
      message: 'Bcrypt password verification evaluated',
      data: {
        hashed,
        matched,
        algorithm: 'bcrypt',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
