import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchEvent } from '../entities/match-event.entity';

@Injectable()
export class MatchEventRepository {
  constructor(
    @InjectRepository(MatchEvent)
    private matchEventRepository: Repository<MatchEvent>,
  ) {}

  save(entity: MatchEvent) {
    return this.matchEventRepository.save(entity);
  }
  find(options?: import('typeorm').FindManyOptions<MatchEvent>) {
    return this.matchEventRepository.find(options);
  }
  findOne(options: import('typeorm').FindOneOptions<MatchEvent>) {
    return this.matchEventRepository.findOne(options);
  }
  remove(entity: MatchEvent) {
    return this.matchEventRepository.remove(entity);
  }
  create(dto: Partial<MatchEvent>) {
    return this.matchEventRepository.create(dto);
  }
}
