import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from './entities/season.entity';
import { SeasonRepository } from './repositories/season.repository';
import { SeasonController } from './season.controller';
import { SeasonService } from './season.service';

@Module({
  imports: [TypeOrmModule.forFeature([Season])],
  controllers: [SeasonController],
  providers: [SeasonService, SeasonRepository],
  exports: [SeasonRepository],
})
export class SeasonModule {}
