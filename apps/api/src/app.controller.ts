import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './common/public.decorator.js';
import type {
  ApiResponse,
  HashVerificationResult,
  ServerStatus,
} from '@repo/shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getInfo(): ApiResponse<{ name: string; company: string; version: string }> {
    return this.appService.getApiInfo();
  }

  @Public()
  @Get('health')
  getHealth(): ApiResponse<ServerStatus> {
    return this.appService.getHealth();
  }

  @Public()
  @Post('verify-password')
  async verifyPassword(
    @Body() body: { password: string; hash?: string },
  ): Promise<ApiResponse<HashVerificationResult>> {
    return this.appService.verifyPassword(body.password, body.hash);
  }
}
