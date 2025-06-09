import { ConfigModule } from "@nestjs/config";

ConfigModule.forRoot({
  envFilePath: process.env.NODE_ENV === 'production' ? '.env.docker' : '.env.local',
});
