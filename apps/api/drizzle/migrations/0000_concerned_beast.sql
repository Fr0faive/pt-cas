CREATE TABLE "ms_distributor" (
	"kode_distributor" varchar(50) PRIMARY KEY NOT NULL,
	"nama_distributor" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ms_outlet" (
	"kode_outlet" varchar(50) PRIMARY KEY NOT NULL,
	"nama_outlet" varchar(255) NOT NULL,
	"kode_distributor" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ms_product" (
	"kode_sku" varchar(50) PRIMARY KEY NOT NULL,
	"nama_sku" varchar(255) NOT NULL,
	"image_url" text NOT NULL,
	"harga_jual" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ms_user" (
	"phone_number" varchar(50) PRIMARY KEY NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"user_password" text NOT NULL,
	"kode_outlet" varchar(50),
	"kode_distributor" varchar(50),
	"role" varchar(50) DEFAULT 'customer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tr_order_detail" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"kode_sku" varchar(50) NOT NULL,
	"qty" integer NOT NULL,
	"harga_jual" numeric(12, 2) NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tr_order_header" (
	"order_number" varchar(50) PRIMARY KEY NOT NULL,
	"order_date" varchar(50) NOT NULL,
	"phone_number" varchar(50) NOT NULL,
	"kode_outlet" varchar(50) NOT NULL,
	"kode_distributor" varchar(50) NOT NULL,
	"order_status" varchar(50) DEFAULT 'Menunggu Konfirmasi' NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ms_outlet" ADD CONSTRAINT "ms_outlet_kode_distributor_ms_distributor_kode_distributor_fk" FOREIGN KEY ("kode_distributor") REFERENCES "public"."ms_distributor"("kode_distributor") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tr_order_detail" ADD CONSTRAINT "tr_order_detail_order_number_tr_order_header_order_number_fk" FOREIGN KEY ("order_number") REFERENCES "public"."tr_order_header"("order_number") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tr_order_detail" ADD CONSTRAINT "tr_order_detail_kode_sku_ms_product_kode_sku_fk" FOREIGN KEY ("kode_sku") REFERENCES "public"."ms_product"("kode_sku") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tr_order_header" ADD CONSTRAINT "tr_order_header_phone_number_ms_user_phone_number_fk" FOREIGN KEY ("phone_number") REFERENCES "public"."ms_user"("phone_number") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tr_order_header" ADD CONSTRAINT "tr_order_header_kode_outlet_ms_outlet_kode_outlet_fk" FOREIGN KEY ("kode_outlet") REFERENCES "public"."ms_outlet"("kode_outlet") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tr_order_header" ADD CONSTRAINT "tr_order_header_kode_distributor_ms_distributor_kode_distributor_fk" FOREIGN KEY ("kode_distributor") REFERENCES "public"."ms_distributor"("kode_distributor") ON DELETE cascade ON UPDATE no action;