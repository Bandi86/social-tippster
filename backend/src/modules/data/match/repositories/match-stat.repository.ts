import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchStat } from '../entities/match-stat.entity';

@Injectable()
export class MatchStatRepository {
  constructor(
    @InjectRepository(MatchStat)
    private matchStatRepository: Repository<MatchStat>,
  ) {}

  save(entity: MatchStat) {
    return this.matchStatRepository.save(entity);
  }
  find(options?: import('typeorm').FindManyOptions<MatchStat>) {
    return this.matchStatRepository.find(options);
  }
  findOne(options: import('typeorm').FindOneOptions<MatchStat>) {
    return this.matchStatRepository.findOne(options);
  }
  remove(entity: MatchStat) {
    return this.matchStatRepository.remove(entity);
  }
  create(dto: Partial<MatchStat>) {
    return this.matchStatRepository.create(dto);
  }
}
