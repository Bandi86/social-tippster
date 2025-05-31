import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Season } from '../entities/season.entity';

@Injectable()
export class SeasonRepository {
  constructor(
    @InjectRepository(Season)
    private seasonRepository: Repository<Season>,
  ) {}

  save(entity: Season) {
    return this.seasonRepository.save(entity);
  }
  find(options?: import('typeorm').FindManyOptions<Season>) {
    return this.seasonRepository.find(options);
  }
  findOne(options: import('typeorm').FindOneOptions<Season>) {
    return this.seasonRepository.findOne(options);
  }
  remove(entity: Season) {
    return this.seasonRepository.remove(entity);
  }
  create(dto: Partial<Season>) {
    return this.seasonRepository.create(dto);
  }
}
