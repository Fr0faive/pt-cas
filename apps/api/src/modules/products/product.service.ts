import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB, type DrizzleDb } from '../../drizzle/drizzle.provider.js';
import { msProduct } from '../../drizzle/schema.js';
import type { ApiResponse, MsProduct, ProductVariant } from '@repo/shared';

@Injectable()
export class ProductService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async findAll(includeAll = false): Promise<ApiResponse<MsProduct[]>> {
    const query = includeAll
      ? this.db.select().from(msProduct)
      : this.db.select().from(msProduct).where(eq(msProduct.isActive, true));

    const products = await query;
    const data: MsProduct[] = products.map((p) => ({
      kodeSKU: p.kodeSKU,
      namaSKU: p.namaSKU,
      imageURL: p.imageURL,
      hargaJual: Number(p.hargaJual),
      isActive: p.isActive,
      variants: (p.variants as ProductVariant[]) || [],
    }));

    return {
      success: true,
      message: 'Katalog produk berhasil dimuat',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  async findOne(sku: string): Promise<ApiResponse<MsProduct>> {
    const [p] = await this.db
      .select()
      .from(msProduct)
      .where(eq(msProduct.kodeSKU, sku));
    if (!p) {
      throw new NotFoundException(`Produk dengan SKU ${sku} tidak ditemukan.`);
    }

    return {
      success: true,
      message: 'Detail produk ditemukan',
      data: {
        kodeSKU: p.kodeSKU,
        namaSKU: p.namaSKU,
        imageURL: p.imageURL,
        hargaJual: Number(p.hargaJual),
        isActive: p.isActive,
        variants: (p.variants as ProductVariant[]) || [],
      },
      timestamp: new Date().toISOString(),
    };
  }

  async create(dto: MsProduct): Promise<ApiResponse<MsProduct>> {
    const [existing] = await this.db
      .select()
      .from(msProduct)
      .where(eq(msProduct.kodeSKU, dto.kodeSKU));
    if (existing) {
      throw new BadRequestException(
        `Produk dengan kode SKU ${dto.kodeSKU} sudah ada.`,
      );
    }

    await this.db.insert(msProduct).values({
      kodeSKU: dto.kodeSKU,
      namaSKU: dto.namaSKU,
      imageURL: dto.imageURL,
      hargaJual: dto.hargaJual.toFixed(2),
      isActive: dto.isActive ?? true,
      variants: dto.variants ?? [],
    });

    return {
      success: true,
      message: 'Produk berhasil ditambahkan',
      data: dto,
      timestamp: new Date().toISOString(),
    };
  }

  async update(
    sku: string,
    dto: Partial<MsProduct>,
  ): Promise<ApiResponse<MsProduct>> {
    const [existing] = await this.db
      .select()
      .from(msProduct)
      .where(eq(msProduct.kodeSKU, sku));
    if (!existing) {
      throw new NotFoundException(`Produk dengan SKU ${sku} tidak ditemukan.`);
    }

    await this.db
      .update(msProduct)
      .set({
        namaSKU: dto.namaSKU ?? existing.namaSKU,
        imageURL: dto.imageURL ?? existing.imageURL,
        hargaJual:
          dto.hargaJual !== undefined
            ? dto.hargaJual.toFixed(2)
            : existing.hargaJual,
        isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
        variants: dto.variants !== undefined ? dto.variants : existing.variants,
      })
      .where(eq(msProduct.kodeSKU, sku));

    return this.findOne(sku);
  }

  async delete(
    sku: string,
  ): Promise<ApiResponse<{ deletedSku: string; isActive: boolean }>> {
    const [existing] = await this.db
      .select()
      .from(msProduct)
      .where(eq(msProduct.kodeSKU, sku));
    if (!existing) {
      throw new NotFoundException(`Produk dengan SKU ${sku} tidak ditemukan.`);
    }

    // Soft delete: tandai is_active = false
    await this.db
      .update(msProduct)
      .set({ isActive: false })
      .where(eq(msProduct.kodeSKU, sku));

    return {
      success: true,
      message: `Produk ${sku} berhasil dinonaktifkan.`,
      data: { deletedSku: sku, isActive: false },
      timestamp: new Date().toISOString(),
    };
  }
}
