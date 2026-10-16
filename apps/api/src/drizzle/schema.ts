import { boolean, integer, jsonb, numeric, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. MsDistributor
export const msDistributor = pgTable('ms_distributor', {
  kodeDistributor: varchar('kode_distributor', { length: 50 }).primaryKey(),
  namaDistributor: varchar('nama_distributor', { length: 255 }).notNull(),
});

// 2. MsOutlet
export const msOutlet = pgTable('ms_outlet', {
  kodeOutlet: varchar('kode_outlet', { length: 50 }).primaryKey(),
  namaOutlet: varchar('nama_outlet', { length: 255 }).notNull(),
  kodeDistributor: varchar('kode_distributor', { length: 50 })
    .notNull()
    .references(() => msDistributor.kodeDistributor, { onDelete: 'cascade' }),
});

// 3. MsUser
export const msUser = pgTable('ms_user', {
  phoneNumber: varchar('phone_number', { length: 50 }).primaryKey(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  userPassword: text('user_password').notNull(),
  kodeOutlet: varchar('kode_outlet', { length: 50 }),
  kodeDistributor: varchar('kode_distributor', { length: 50 }),
  role: varchar('role', { length: 50 }).notNull().default('customer'), // 'admin' | 'customer'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. MsProduct
export const msProduct = pgTable('ms_product', {
  kodeSKU: varchar('kode_sku', { length: 50 }).primaryKey(),
  namaSKU: varchar('nama_sku', { length: 255 }).notNull(),
  imageURL: text('image_url').notNull(),
  hargaJual: numeric('harga_jual', { precision: 12, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  variants: jsonb('variants').default([]).notNull(),
});

// 5. TrOrderHeader
export const trOrderHeader = pgTable('tr_order_header', {
  orderNumber: varchar('order_number', { length: 50 }).primaryKey(),
  orderDate: varchar('order_date', { length: 50 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 50 })
    .notNull()
    .references(() => msUser.phoneNumber, { onDelete: 'cascade' }),
  kodeOutlet: varchar('kode_outlet', { length: 50 })
    .notNull()
    .references(() => msOutlet.kodeOutlet, { onDelete: 'cascade' }),
  kodeDistributor: varchar('kode_distributor', { length: 50 })
    .notNull()
    .references(() => msDistributor.kodeDistributor, { onDelete: 'cascade' }),
  orderStatus: varchar('order_status', { length: 50 }).notNull().default('Menunggu Konfirmasi'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  paymentMethod: varchar('payment_method', { length: 50 }).default('QRIS'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 6. TrOrderDetail
export const trOrderDetail = pgTable('tr_order_detail', {
  id: serial('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 50 })
    .notNull()
    .references(() => trOrderHeader.orderNumber, { onDelete: 'cascade' }),
  kodeSKU: varchar('kode_sku', { length: 50 })
    .notNull()
    .references(() => msProduct.kodeSKU, { onDelete: 'cascade' }),
  qty: integer('qty').notNull(),
  hargaJual: numeric('harga_jual', { precision: 12, scale: 2 }).notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
});

// Relations for relational queries
export const msDistributorRelations = relations(msDistributor, ({ many }) => ({
  outlets: many(msOutlet),
  orders: many(trOrderHeader),
}));

export const msOutletRelations = relations(msOutlet, ({ one, many }) => ({
  distributor: one(msDistributor, {
    fields: [msOutlet.kodeDistributor],
    references: [msDistributor.kodeDistributor],
  }),
  orders: many(trOrderHeader),
}));

export const msUserRelations = relations(msUser, ({ many }) => ({
  orders: many(trOrderHeader),
}));

export const trOrderHeaderRelations = relations(trOrderHeader, ({ one, many }) => ({
  user: one(msUser, {
    fields: [trOrderHeader.phoneNumber],
    references: [msUser.phoneNumber],
  }),
  outlet: one(msOutlet, {
    fields: [trOrderHeader.kodeOutlet],
    references: [msOutlet.kodeOutlet],
  }),
  distributor: one(msDistributor, {
    fields: [trOrderHeader.kodeDistributor],
    references: [msDistributor.kodeDistributor],
  }),
  details: many(trOrderDetail),
}));

export const trOrderDetailRelations = relations(trOrderDetail, ({ one }) => ({
  header: one(trOrderHeader, {
    fields: [trOrderDetail.orderNumber],
    references: [trOrderHeader.orderNumber],
  }),
  product: one(msProduct, {
    fields: [trOrderDetail.kodeSKU],
    references: [msProduct.kodeSKU],
  }),
}));
