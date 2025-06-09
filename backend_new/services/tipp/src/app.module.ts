import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

//import { TippModule } from './tipp/tipp.module';
//import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '.env.development', '.env.production'],
    }),
  ],
})
export class AppModule {}
