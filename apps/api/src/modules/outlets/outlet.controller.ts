import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { OutletService } from './outlet.service.js';
import { Public } from '../../common/public.decorator.js';
import type { ApiResponse, MsDistributor, MsOutlet } from '@repo/shared';
import type { Request } from 'express';

interface AuthenticatedUser {
  phoneNumber: string;
  userName: string;
  role: string;
}

@Controller()
export class OutletController {
  constructor(private readonly outletService: OutletService) {}

  private checkSuperadmin(req: Request & { user?: AuthenticatedUser }) {
    const role = req.user?.role;
    if (role !== 'superadmin' && role !== 'admin') {
      throw new ForbiddenException(
        'Hanya superadmin yang memiliki akses untuk mengelola outlet dan distributor.',
      );
    }
  }

  @Public()
  @Get('distributors')
  async getDistributors(): Promise<ApiResponse<MsDistributor[]>> {
    return this.outletService.getDistributors();
  }

  @Post('distributors')
  async createDistributor(
    @Body() dto: MsDistributor,
    @Req() req: Request & { user?: AuthenticatedUser },
  ): Promise<ApiResponse<MsDistributor>> {
    this.checkSuperadmin(req);
    return this.outletService.createDistributor(dto);
  }

  @Put('distributors/:kodeDistributor')
  async updateDistributor(
    @Param('kodeDistributor') kodeDistributor: string,
    @Body() dto: Partial<MsDistributor>,
    @Req() req: Request & { user?: AuthenticatedUser },
  ): Promise<ApiResponse<MsDistributor>> {
    this.checkSuperadmin(req);
    return this.outletService.updateDistributor(kodeDistributor, dto);
  }

  @Delete('distributors/:kodeDistributor')
  async deleteDistributor(
    @Param('kodeDistributor') kodeDistributor: string,
    @Req() req: Request & { user?: AuthenticatedUser },
  ): Promise<ApiResponse<{ deletedCode: string }>> {
    this.checkSuperadmin(req);
    return this.outletService.deleteDistributor(kodeDistributor);
  }

  @Public()
  @Get('outlets')
  async getOutlets(
    @Query('kodeDistributor') kodeDistributor?: string,
  ): Promise<ApiResponse<MsOutlet[]>> {
    return this.outletService.getOutlets(kodeDistributor);
  }

  @Post('outlets')
  async createOutlet(
    @Body() dto: MsOutlet,
    @Req() req: Request & { user?: AuthenticatedUser },
  ): Promise<ApiResponse<MsOutlet>> {
    this.checkSuperadmin(req);
    return this.outletService.createOutlet(dto);
  }

  @Put('outlets/:kodeOutlet')
  async updateOutlet(
    @Param('kodeOutlet') kodeOutlet: string,
    @Body() dto: Partial<MsOutlet>,
    @Req() req: Request & { user?: AuthenticatedUser },
  ): Promise<ApiResponse<MsOutlet>> {
    this.checkSuperadmin(req);
    return this.outletService.updateOutlet(kodeOutlet, dto);
  }

  @Delete('outlets/:kodeOutlet')
  async deleteOutlet(
    @Param('kodeOutlet') kodeOutlet: string,
    @Req() req: Request & { user?: AuthenticatedUser },
  ): Promise<ApiResponse<{ deletedCode: string }>> {
    this.checkSuperadmin(req);
    return this.outletService.deleteOutlet(kodeOutlet);
  }
}
