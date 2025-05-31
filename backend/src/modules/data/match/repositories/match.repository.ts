import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../entities/match.entity';

@Injectable()
export class MatchRepository {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) {}

  save(entity: Match) {
    return this.matchRepository.save(entity);
  }
  find(options?: import('typeorm').FindManyOptions<Match>) {
    return this.matchRepository.find(options);
  }
  findOne(options: import('typeorm').FindOneOptions<Match>) {
    return this.matchRepository.findOne(options);
  }
  remove(entity: Match) {
    return this.matchRepository.remove(entity);
  }
  create(dto: Partial<Match>) {
    // Convert date string to Date if needed
    if (dto.date && typeof dto.date === 'string') {
      dto.date = new Date(dto.date);
    }
    return this.matchRepository.create(dto);
  }
}
