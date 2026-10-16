import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ProductService } from './product.service.js';
import { Public } from '../../common/public.decorator.js';
import type { ApiResponse, MsProduct } from '@repo/shared';
import type { Request } from 'express';

interface AuthenticatedUser {
  phoneNumber: string;
  userName: string;
  role: string;
}

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Public()
  @Get()
  async findAll(@Query('all') all?: string): Promise<ApiResponse<MsProduct[]>> {
    return this.productService.findAll(all === 'true');
  }

  @Public()
  @Get(':sku')
  async findOne(@Param('sku') sku: string): Promise<ApiResponse<MsProduct>> {
    return this.productService.findOne(sku);
  }

  @Post()
  async create(
    @Body() dto: MsProduct,
    @Req() req: Request & { user?: AuthenticatedUser },
  ): Promise<ApiResponse<MsProduct>> {
    const role = req.user?.role;
    if (role !== 'superadmin' && role !== 'admin') {
      throw new ForbiddenException('Hanya superadmin yang dapat menambahkan produk baru.');
    }
    return this.productService.create(dto);
  }

  @Put(':sku')
  async update(
    @Param('sku') sku: string,
    @Body() dto: Partial<MsProduct>,
    @Req() req: Request & { user?: AuthenticatedUser },
  ): Promise<ApiResponse<MsProduct>> {
    const role = req.user?.role;
    if (role !== 'superadmin' && role !== 'admin') {
      throw new ForbiddenException('Hanya superadmin yang dapat mengubah data produk.');
    }
    return this.productService.update(sku, dto);
  }

  @Delete(':sku')
  async delete(
    @Param('sku') sku: string,
    @Req() req: Request & { user?: AuthenticatedUser },
  ): Promise<ApiResponse<{ deletedSku: string }>> {
    const role = req.user?.role;
    if (role !== 'superadmin' && role !== 'admin') {
      throw new ForbiddenException('Hanya superadmin yang dapat menghapus produk.');
    }
    return this.productService.delete(sku);
  }
}
