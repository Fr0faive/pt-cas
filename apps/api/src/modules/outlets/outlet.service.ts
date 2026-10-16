import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB, type DrizzleDb } from '../../drizzle/drizzle.provider.js';
import { msDistributor, msOutlet } from '../../drizzle/schema.js';
import type { ApiResponse, MsDistributor, MsOutlet } from '@repo/shared';

@Injectable()
export class OutletService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async getDistributors(): Promise<ApiResponse<MsDistributor[]>> {
    const list = await this.db.select().from(msDistributor);
    return {
      success: true,
      message: 'Daftar distributor berhasil dimuat',
      data: list,
      timestamp: new Date().toISOString(),
    };
  }

  async createDistributor(dto: MsDistributor): Promise<ApiResponse<MsDistributor>> {
    if (!dto.kodeDistributor?.trim() || !dto.namaDistributor?.trim()) {
      throw new BadRequestException('Kode dan nama distributor wajib diisi.');
    }

    const cleanCode = dto.kodeDistributor.trim().toUpperCase();
    const cleanName = dto.namaDistributor.trim();

    const [existing] = await this.db
      .select()
      .from(msDistributor)
      .where(eq(msDistributor.kodeDistributor, cleanCode));

    if (existing) {
      throw new BadRequestException(`Distributor dengan kode ${cleanCode} sudah ada.`);
    }

    await this.db.insert(msDistributor).values({
      kodeDistributor: cleanCode,
      namaDistributor: cleanName,
    });

    return {
      success: true,
      message: 'Distributor berhasil ditambahkan',
      data: { kodeDistributor: cleanCode, namaDistributor: cleanName },
      timestamp: new Date().toISOString(),
    };
  }

  async updateDistributor(
    kodeDistributor: string,
    dto: Partial<MsDistributor>,
  ): Promise<ApiResponse<MsDistributor>> {
    const [existing] = await this.db
      .select()
      .from(msDistributor)
      .where(eq(msDistributor.kodeDistributor, kodeDistributor));

    if (!existing) {
      throw new NotFoundException(`Distributor ${kodeDistributor} tidak ditemukan.`);
    }

    await this.db
      .update(msDistributor)
      .set({
        namaDistributor: dto.namaDistributor?.trim() || existing.namaDistributor,
      })
      .where(eq(msDistributor.kodeDistributor, kodeDistributor));

    return {
      success: true,
      message: 'Distributor berhasil diperbarui',
      data: {
        kodeDistributor,
        namaDistributor: dto.namaDistributor?.trim() || existing.namaDistributor,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async deleteDistributor(kodeDistributor: string): Promise<ApiResponse<{ deletedCode: string }>> {
    const [existing] = await this.db
      .select()
      .from(msDistributor)
      .where(eq(msDistributor.kodeDistributor, kodeDistributor));

    if (!existing) {
      throw new NotFoundException(`Distributor ${kodeDistributor} tidak ditemukan.`);
    }

    const [outletUsing] = await this.db
      .select()
      .from(msOutlet)
      .where(eq(msOutlet.kodeDistributor, kodeDistributor));

    if (outletUsing) {
      throw new BadRequestException(
        `Distributor ${kodeDistributor} tidak dapat dihapus karena masih digunakan oleh outlet (${outletUsing.namaOutlet}).`,
      );
    }

    await this.db.delete(msDistributor).where(eq(msDistributor.kodeDistributor, kodeDistributor));

    return {
      success: true,
      message: 'Distributor berhasil dihapus',
      data: { deletedCode: kodeDistributor },
      timestamp: new Date().toISOString(),
    };
  }

  async getOutlets(kodeDistributor?: string): Promise<ApiResponse<MsOutlet[]>> {
    let list;
    if (kodeDistributor) {
      list = await this.db
        .select()
        .from(msOutlet)
        .where(eq(msOutlet.kodeDistributor, kodeDistributor));
    } else {
      list = await this.db.select().from(msOutlet);
    }

    return {
      success: true,
      message: 'Daftar outlet berhasil dimuat',
      data: list,
      timestamp: new Date().toISOString(),
    };
  }

  async createOutlet(dto: MsOutlet): Promise<ApiResponse<MsOutlet>> {
    if (!dto.kodeOutlet?.trim() || !dto.namaOutlet?.trim() || !dto.kodeDistributor?.trim()) {
      throw new BadRequestException('Kode outlet, nama outlet, dan distributor wajib diisi.');
    }

    const cleanCode = dto.kodeOutlet.trim().toUpperCase();
    const cleanName = dto.namaOutlet.trim();
    const cleanDist = dto.kodeDistributor.trim();

    const [existing] = await this.db
      .select()
      .from(msOutlet)
      .where(eq(msOutlet.kodeOutlet, cleanCode));

    if (existing) {
      throw new BadRequestException(`Outlet dengan kode ${cleanCode} sudah ada.`);
    }

    const [distExists] = await this.db
      .select()
      .from(msDistributor)
      .where(eq(msDistributor.kodeDistributor, cleanDist));

    if (!distExists) {
      throw new BadRequestException(
        `Distributor dengan kode "${cleanDist}" tidak terdaftar di sistem. Silakan pilih distributor yang valid.`,
      );
    }

    await this.db.insert(msOutlet).values({
      kodeOutlet: cleanCode,
      namaOutlet: cleanName,
      kodeDistributor: cleanDist,
    });

    return {
      success: true,
      message: 'Outlet berhasil ditambahkan',
      data: { kodeOutlet: cleanCode, namaOutlet: cleanName, kodeDistributor: cleanDist },
      timestamp: new Date().toISOString(),
    };
  }

  async updateOutlet(kodeOutlet: string, dto: Partial<MsOutlet>): Promise<ApiResponse<MsOutlet>> {
    const [existing] = await this.db
      .select()
      .from(msOutlet)
      .where(eq(msOutlet.kodeOutlet, kodeOutlet));

    if (!existing) {
      throw new NotFoundException(`Outlet ${kodeOutlet} tidak ditemukan.`);
    }

    if (dto.kodeDistributor) {
      const cleanDist = dto.kodeDistributor.trim();
      const [distExists] = await this.db
        .select()
        .from(msDistributor)
        .where(eq(msDistributor.kodeDistributor, cleanDist));

      if (!distExists) {
        throw new BadRequestException(
          `Distributor dengan kode "${cleanDist}" tidak terdaftar di sistem.`,
        );
      }
    }

    const updatedData = {
      namaOutlet: dto.namaOutlet?.trim() || existing.namaOutlet,
      kodeDistributor: dto.kodeDistributor?.trim() || existing.kodeDistributor,
    };

    await this.db.update(msOutlet).set(updatedData).where(eq(msOutlet.kodeOutlet, kodeOutlet));

    return {
      success: true,
      message: 'Outlet berhasil diperbarui',
      data: { kodeOutlet, ...updatedData },
      timestamp: new Date().toISOString(),
    };
  }

  async deleteOutlet(kodeOutlet: string): Promise<ApiResponse<{ deletedCode: string }>> {
    const [existing] = await this.db
      .select()
      .from(msOutlet)
      .where(eq(msOutlet.kodeOutlet, kodeOutlet));

    if (!existing) {
      throw new NotFoundException(`Outlet ${kodeOutlet} tidak ditemukan.`);
    }

    await this.db.delete(msOutlet).where(eq(msOutlet.kodeOutlet, kodeOutlet));

    return {
      success: true,
      message: 'Outlet berhasil dihapus',
      data: { deletedCode: kodeOutlet },
      timestamp: new Date().toISOString(),
    };
  }
}
