import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DrizzleModule } from './drizzle/drizzle.module.js';
import { PasswordService } from './common/password.service.js';
import { JwtAuthGuard } from './common/jwt-auth.guard.js';
import { AuthController } from './modules/auth/auth.controller.js';
import { AuthService } from './modules/auth/auth.service.js';
import { ProductController } from './modules/products/product.controller.js';
import { ProductService } from './modules/products/product.service.js';
import { OutletController } from './modules/outlets/outlet.controller.js';
import { OutletService } from './modules/outlets/outlet.service.js';
import { OrderController } from './modules/orders/order.controller.js';
import { OrderService } from './modules/orders/order.service.js';
import { SeedController } from './modules/seed/seed.controller.js';
import { SeedService } from './modules/seed/seed.service.js';

@Module({
  imports: [DrizzleModule],
  controllers: [
    AppController,
    AuthController,
    ProductController,
    OutletController,
    OrderController,
    SeedController,
  ],
  providers: [
    AppService,
    PasswordService,
    AuthService,
    ProductService,
    OutletService,
    OrderService,
    SeedService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
