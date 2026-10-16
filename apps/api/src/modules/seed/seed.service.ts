import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DRIZZLE_DB, type DrizzleDb } from '../../drizzle/drizzle.provider.js';
import {
  msDistributor,
  msOutlet,
  msProduct,
  msUser,
  trOrderDetail,
  trOrderHeader,
} from '../../drizzle/schema.js';
import { PasswordService } from '../../common/password.service.js';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDb,
    private readonly passwordService: PasswordService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAll();
  }

  async seedAll(): Promise<{ message: string }> {
    try {
      this.logger.log(
        'Checking and seeding initial master data in PostgreSQL...',
      );

      // Ensure payment_method column exists on tr_order_header
      try {
        await this.db.execute(
          sql`ALTER TABLE tr_order_header ADD COLUMN IF NOT EXISTS payment_method varchar(50) DEFAULT 'QRIS';`,
        );
      } catch {
        // Table or column already in desired state
      }

      // 1. Seed Distributors
      const defaultDistributors = [
        {
          kodeDistributor: 'DIST-001',
          namaDistributor: 'PT Cardig Distribusi Utama',
        },
        {
          kodeDistributor: 'DIST-002',
          namaDistributor: 'PT Logistik Sejahtera Abadi',
        },
      ];

      for (const dist of defaultDistributors) {
        const [existing] = await this.db
          .select()
          .from(msDistributor)
          .where(eq(msDistributor.kodeDistributor, dist.kodeDistributor));
        if (!existing) {
          await this.db.insert(msDistributor).values(dist);
          this.logger.log(`Distributor ${dist.kodeDistributor} seeded.`);
        }
      }

      // 2. Seed Outlets
      const defaultOutlets = [
        {
          kodeOutlet: 'OUT-001',
          namaOutlet: 'Toko Berkah CAS Soekarno-Hatta',
          kodeDistributor: 'DIST-001',
        },
        {
          kodeOutlet: 'OUT-002',
          namaOutlet: 'Minimarket Bandara Express',
          kodeDistributor: 'DIST-001',
        },
        {
          kodeOutlet: 'OUT-003',
          namaOutlet: 'Kantin Cardig Aero Services',
          kodeDistributor: 'DIST-002',
        },
      ];

      for (const outlet of defaultOutlets) {
        // Ensure parent distributor exists first to satisfy foreign key constraint
        const [distExists] = await this.db
          .select()
          .from(msDistributor)
          .where(eq(msDistributor.kodeDistributor, outlet.kodeDistributor));

        if (!distExists) {
          await this.db.insert(msDistributor).values({
            kodeDistributor: outlet.kodeDistributor,
            namaDistributor: `Distributor ${outlet.kodeDistributor}`,
          });
        }

        const [existing] = await this.db
          .select()
          .from(msOutlet)
          .where(eq(msOutlet.kodeOutlet, outlet.kodeOutlet));
        if (!existing) {
          await this.db.insert(msOutlet).values(outlet);
          this.logger.log(`Outlet ${outlet.kodeOutlet} seeded.`);
        }
      }

      // 3. Seed Users (Admin & Customer)
      const defaultUsers = [
        {
          phoneNumber: '081200000001',
          userName: 'Super Admin CAS',
          plainPassword: 'admin123',
          kodeOutlet: 'OUT-001',
          kodeDistributor: 'DIST-001',
          role: 'superadmin' as const,
        },
        {
          phoneNumber: '081298765432',
          userName: 'Budi (Toko Berkah)',
          plainPassword: 'customer123',
          kodeOutlet: 'OUT-001',
          kodeDistributor: 'DIST-001',
          role: 'customer' as const,
        },
      ];

      for (const u of defaultUsers) {
        const [existing] = await this.db
          .select()
          .from(msUser)
          .where(eq(msUser.phoneNumber, u.phoneNumber));
        if (!existing) {
          const hashed = await this.passwordService.hash(u.plainPassword);
          await this.db.insert(msUser).values({
            phoneNumber: u.phoneNumber,
            userName: u.userName,
            userPassword: hashed,
            kodeOutlet: u.kodeOutlet,
            kodeDistributor: u.kodeDistributor,
            role: u.role,
          });
          this.logger.log(`User ${u.phoneNumber} (${u.role}) seeded.`);
        } else if (u.role === 'superadmin' && existing.role !== 'superadmin') {
          await this.db
            .update(msUser)
            .set({ role: 'superadmin', userName: u.userName })
            .where(eq(msUser.phoneNumber, u.phoneNumber));
        }
      }

      // 4. Seed Products
      const defaultProducts = [
        {
          kodeSKU: 'EI-A01',
          namaSKU: 'Acne + Anti Aging Serum',
          imageURL:
            'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=60',
          hargaJual: '18000.00',
          isActive: true,
          variants: [{ id: 'var-1', namaVarian: 'Ukuran 30ml', addPrice: 0 }],
        },
        {
          kodeSKU: 'EI-A02',
          namaSKU: 'Hydration Booster Serum',
          imageURL:
            'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=60',
          hargaJual: '18000.00',
          isActive: true,
          variants: [{ id: 'var-2', namaVarian: 'Ukuran 30ml', addPrice: 0 }],
        },
        {
          kodeSKU: 'EI-A03',
          namaSKU: 'Hydrating Moisturizer',
          imageURL:
            'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=60',
          hargaJual: '18000.00',
          isActive: true,
          variants: [
            { id: 'var-3a', namaVarian: 'Reguler 30g', addPrice: 0 },
            { id: 'var-3b', namaVarian: 'Jumbo 50g', addPrice: 20000 },
          ],
        },
      ];

      for (const prod of defaultProducts) {
        const [existing] = await this.db
          .select()
          .from(msProduct)
          .where(eq(msProduct.kodeSKU, prod.kodeSKU));
        if (!existing) {
          await this.db.insert(msProduct).values(prod);
          this.logger.log(`Product ${prod.kodeSKU} seeded.`);
        }
      }

      // 5. Seed Sample Order
      const existingOrders = await this.db.select().from(trOrderHeader);
      if (existingOrders.length === 0) {
        const orderNumber = 'CAS-20261009-5725';
        const today = new Date().toISOString().split('T')[0];

        await this.db.insert(trOrderHeader).values({
          orderNumber,
          orderDate: today,
          phoneNumber: '081298765432',
          kodeOutlet: 'OUT-001',
          kodeDistributor: 'DIST-001',
          orderStatus: 'Diproses',
          totalAmount: '45500.00',
          paymentMethod: 'QRIS',
        });

        await this.db.insert(trOrderDetail).values([
          {
            orderNumber,
            kodeSKU: 'EI-A01',
            qty: 2,
            hargaJual: '18000.00',
            subtotal: '36000.00',
          },
          {
            orderNumber,
            kodeSKU: 'EI-A02',
            qty: 1,
            hargaJual: '9500.00',
            subtotal: '9500.00',
          },
        ]);
        this.logger.log('Sample order seeded.');
      } else {
        const existingDetails = await this.db.select().from(trOrderDetail);
        if (existingDetails.length === 0) {
          await this.db.insert(trOrderDetail).values([
            {
              orderNumber: 'CAS-20261009-5725',
              kodeSKU: 'EI-A01',
              qty: 2,
              hargaJual: '18000.00',
              subtotal: '36000.00',
            },
            {
              orderNumber: 'CAS-20261009-5725',
              kodeSKU: 'EI-A02',
              qty: 1,
              hargaJual: '9500.00',
              subtotal: '9500.00',
            },
          ]);
          this.logger.log('Sample order details seeded.');
        }
      }

      return { message: 'Database seeded successfully' };
    } catch (err) {
      this.logger.error('Error during database seed:', err);
      throw err;
    }
  }
}
