import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DRIZZLE_DB, type DrizzleDb } from '../../drizzle/drizzle.provider.js';
import {
  msDistributor,
  msOutlet,
  msProduct,
  msUser,
  trOrderDetail,
  trOrderHeader,
} from '../../drizzle/schema.js';
import type {
  ApiResponse,
  CreateOrderDto,
  OrderDetailWithProduct,
  OrderWithDetails,
  UpdateOrderStatusDto,
} from '@repo/shared';

@Injectable()
export class OrderService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async createOrder(dto: CreateOrderDto): Promise<ApiResponse<OrderWithDetails>> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Keranjang pesanan tidak boleh kosong.');
    }

    // 1. Generate Order Number: CAS-YYYYMMDD-XXXX (e.g. CAS-20261009-5725)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `CAS-${dateStr}-${randomSuffix}`;
    const today = `${year}-${month}-${day}`;

    // 2. Calculate Total Amount
    let total = 0;
    const detailInserts = dto.items.map((item) => {
      const subtotal = item.qty * item.hargaJual;
      total += subtotal;
      return {
        orderNumber,
        kodeSKU: item.kodeSKU,
        qty: item.qty,
        hargaJual: item.hargaJual.toFixed(2),
        subtotal: subtotal.toFixed(2),
      };
    });

    // 3. Insert Header
    await this.db.insert(trOrderHeader).values({
      orderNumber,
      orderDate: today,
      phoneNumber: dto.phoneNumber,
      kodeOutlet: dto.kodeOutlet,
      kodeDistributor: dto.kodeDistributor,
      orderStatus: 'Menunggu Konfirmasi',
      totalAmount: total.toFixed(2),
      paymentMethod: dto.paymentMethod || 'QRIS',
    });

    // 4. Insert Details
    await this.db.insert(trOrderDetail).values(detailInserts);

    return this.getOrderByNumber(orderNumber);
  }

  async getOrders(phoneNumber?: string): Promise<ApiResponse<OrderWithDetails[]>> {
    let headers;
    if (phoneNumber) {
      headers = await this.db
        .select()
        .from(trOrderHeader)
        .where(eq(trOrderHeader.phoneNumber, phoneNumber))
        .orderBy(desc(trOrderHeader.createdAt));
    } else {
      headers = await this.db
        .select()
        .from(trOrderHeader)
        .orderBy(desc(trOrderHeader.createdAt));
    }

    const ordersWithDetails: OrderWithDetails[] = [];

    for (const h of headers) {
      // Get Outlet
      const [outlet] = await this.db
        .select()
        .from(msOutlet)
        .where(eq(msOutlet.kodeOutlet, h.kodeOutlet));

      // Get Distributor
      const [distributor] = await this.db
        .select()
        .from(msDistributor)
        .where(eq(msDistributor.kodeDistributor, h.kodeDistributor));

      // Get User Name
      const [user] = await this.db
        .select()
        .from(msUser)
        .where(eq(msUser.phoneNumber, h.phoneNumber));

      // Get Details with Product info
      const rawDetails = await this.db
        .select()
        .from(trOrderDetail)
        .where(eq(trOrderDetail.orderNumber, h.orderNumber));

      const items: OrderDetailWithProduct[] = [];
      for (const d of rawDetails) {
        const [prod] = await this.db
          .select()
          .from(msProduct)
          .where(eq(msProduct.kodeSKU, d.kodeSKU));

        items.push({
          id: d.id,
          orderNumber: d.orderNumber,
          kodeSKU: d.kodeSKU,
          qty: d.qty,
          hargaJual: Number(d.hargaJual),
          subtotal: Number(d.subtotal),
          product: prod
            ? {
                kodeSKU: prod.kodeSKU,
                namaSKU: prod.namaSKU,
                imageURL: prod.imageURL,
                hargaJual: Number(prod.hargaJual),
              }
            : undefined,
        });
      }

      ordersWithDetails.push({
        orderNumber: h.orderNumber,
        orderDate: h.orderDate,
        phoneNumber: h.phoneNumber,
        kodeOutlet: h.kodeOutlet,
        kodeDistributor: h.kodeDistributor,
        orderStatus: h.orderStatus as OrderWithDetails['orderStatus'],
        totalAmount: Number(h.totalAmount),
        customerName: user?.userName ?? '',
        outlet: outlet ? { kodeOutlet: outlet.kodeOutlet, namaOutlet: outlet.namaOutlet, kodeDistributor: outlet.kodeDistributor } : undefined,
        distributor: distributor ? { kodeDistributor: distributor.kodeDistributor, namaDistributor: distributor.namaDistributor } : undefined,
        items,
      });
    }

    return {
      success: true,
      message: 'Riwayat pesanan berhasil dimuat',
      data: ordersWithDetails,
      timestamp: new Date().toISOString(),
    };
  }

  async getOrderByNumber(orderNumber: string): Promise<ApiResponse<OrderWithDetails>> {
    const [h] = await this.db
      .select()
      .from(trOrderHeader)
      .where(eq(trOrderHeader.orderNumber, orderNumber));

    if (!h) {
      throw new NotFoundException(`Pesanan ${orderNumber} tidak ditemukan.`);
    }

    const [outlet] = await this.db
      .select()
      .from(msOutlet)
      .where(eq(msOutlet.kodeOutlet, h.kodeOutlet));

    const [distributor] = await this.db
      .select()
      .from(msDistributor)
      .where(eq(msDistributor.kodeDistributor, h.kodeDistributor));

    const [user] = await this.db
      .select()
      .from(msUser)
      .where(eq(msUser.phoneNumber, h.phoneNumber));

    const rawDetails = await this.db
      .select()
      .from(trOrderDetail)
      .where(eq(trOrderDetail.orderNumber, h.orderNumber));

    const items: OrderDetailWithProduct[] = [];
    for (const d of rawDetails) {
      const [prod] = await this.db
        .select()
        .from(msProduct)
        .where(eq(msProduct.kodeSKU, d.kodeSKU));

      items.push({
        id: d.id,
        orderNumber: d.orderNumber,
        kodeSKU: d.kodeSKU,
        qty: d.qty,
        hargaJual: Number(d.hargaJual),
        subtotal: Number(d.subtotal),
        product: prod
          ? {
              kodeSKU: prod.kodeSKU,
              namaSKU: prod.namaSKU,
              imageURL: prod.imageURL,
              hargaJual: Number(prod.hargaJual),
            }
          : undefined,
      });
    }

    return {
      success: true,
      message: 'Detail pesanan ditemukan',
      data: {
        orderNumber: h.orderNumber,
        orderDate: h.orderDate,
        phoneNumber: h.phoneNumber,
        kodeOutlet: h.kodeOutlet,
        kodeDistributor: h.kodeDistributor,
        orderStatus: h.orderStatus as OrderWithDetails['orderStatus'],
        totalAmount: Number(h.totalAmount),
        customerName: user?.userName ?? '',
        outlet: outlet ? { kodeOutlet: outlet.kodeOutlet, namaOutlet: outlet.namaOutlet, kodeDistributor: outlet.kodeDistributor } : undefined,
        distributor: distributor ? { kodeDistributor: distributor.kodeDistributor, namaDistributor: distributor.namaDistributor } : undefined,
        items,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async updateStatus(orderNumber: string, dto: UpdateOrderStatusDto): Promise<ApiResponse<OrderWithDetails>> {
    const [h] = await this.db
      .select()
      .from(trOrderHeader)
      .where(eq(trOrderHeader.orderNumber, orderNumber));

    if (!h) {
      throw new NotFoundException(`Pesanan ${orderNumber} tidak ditemukan.`);
    }

    await this.db
      .update(trOrderHeader)
      .set({ orderStatus: dto.orderStatus })
      .where(eq(trOrderHeader.orderNumber, orderNumber));

    return this.getOrderByNumber(orderNumber);
  }
}
