import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { OrderService } from './order.service.js';
import type { ApiResponse, CreateOrderDto, OrderWithDetails, UpdateOrderStatusDto } from '@repo/shared';
import type { Request } from 'express';

interface AuthenticatedUser {
  phoneNumber: string;
  userName: string;
  role: string;
}

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @Body() dto: CreateOrderDto,
    @Req() req: Request & { user?: AuthenticatedUser },
  ): Promise<ApiResponse<OrderWithDetails>> {
    if (req.user?.role === 'customer') {
      dto.phoneNumber = req.user.phoneNumber;
    }
    return this.orderService.createOrder(dto);
  }

  @Get()
  async getOrders(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Query('phone') phone?: string,
  ): Promise<ApiResponse<OrderWithDetails[]>> {
    if (req.user?.role === 'customer') {
      return this.orderService.getOrders(req.user.phoneNumber);
    }
    return this.orderService.getOrders(phone);
  }

  @Get(':orderNumber')
  async getOrderByNumber(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Param('orderNumber') orderNumber: string,
  ): Promise<ApiResponse<OrderWithDetails>> {
    const res = await this.orderService.getOrderByNumber(orderNumber);
    if (req.user?.role === 'customer' && res.data.phoneNumber !== req.user.phoneNumber) {
      throw new ForbiddenException('Akses ditolak. Anda hanya dapat melihat pesanan Anda sendiri.');
    }
    return res;
  }

  @Patch(':orderNumber/status')
  async updateStatus(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Param('orderNumber') orderNumber: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<ApiResponse<OrderWithDetails>> {
    const role = req.user?.role;
    if (role !== 'superadmin' && role !== 'admin') {
      throw new ForbiddenException('Hanya superadmin yang dapat memperbarui status pesanan.');
    }
    return this.orderService.updateStatus(orderNumber, dto);
  }
}
