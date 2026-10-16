import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Public } from '../../common/public.decorator.js';
import type {
  ApiResponse,
  AuthResponseData,
  AuthTokens,
  LoginDto,
  MsUserSafe,
  RefreshTokenDto,
  RegisterDto,
} from '@repo/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<ApiResponse<AuthResponseData>> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<ApiResponse<AuthResponseData>> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto): Promise<ApiResponse<AuthTokens>> {
    return this.authService.refresh(dto);
  }

  @Public()
  @Get('profile/:phone')
  async getProfile(
    @Param('phone') phone: string,
  ): Promise<ApiResponse<MsUserSafe & { outletName?: string; distributorName?: string }>> {
    return this.authService.getProfile(phone);
  }
}
