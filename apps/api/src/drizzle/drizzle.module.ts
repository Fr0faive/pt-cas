import { Global, Module } from '@nestjs/common';
import { DRIZZLE_DB, drizzleProvider } from './drizzle.provider.js';

@Global()
@Module({
  providers: [drizzleProvider],
  exports: [DRIZZLE_DB],
})
export class DrizzleModule {}
