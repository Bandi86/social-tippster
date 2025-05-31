import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeasonModule } from '../season/season.module';
import { TeamModule } from '../team/team.module';
import { MatchController } from './/match.controller';
import { MatchService } from './/match.service';
import { MatchEvent } from './entities/match-event.entity';
import { MatchStat } from './entities/match-stat.entity';
import { Match } from './entities/match.entity';
import { MatchEventRepository } from './repositories/match-event.repository';
import { MatchStatRepository } from './repositories/match-stat.repository';
import { MatchRepository } from './repositories/match.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Match, MatchEvent, MatchStat]), SeasonModule, TeamModule],
  controllers: [MatchController],
  providers: [MatchService, MatchRepository, MatchEventRepository, MatchStatRepository],
  exports: [MatchService],
})
export class MatchModule {}
