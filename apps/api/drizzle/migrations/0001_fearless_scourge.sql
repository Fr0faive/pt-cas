ALTER TABLE "ms_product" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "ms_product" ADD COLUMN "variants" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tr_order_header" ADD COLUMN "payment_method" varchar(50) DEFAULT 'QRIS';