import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLeagueDto } from './dto/create-league.dto';
import { UpdateLeagueDto } from './dto/update-league.dto';
import { League } from './entities/league.entity';

@Injectable()
export class LeagueService {
  constructor(
    @InjectRepository(League)
    private readonly leagueRepository: Repository<League>,
  ) {}

  async create(createLeagueDto: CreateLeagueDto): Promise<League> {
    const league = this.leagueRepository.create(createLeagueDto);
    return await this.leagueRepository.save(league);
  }

  async findAll(): Promise<League[]> {
    return await this.leagueRepository.find({
      relations: ['teams', 'seasons'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<League> {
    const league = await this.leagueRepository.findOne({
      where: { id },
      relations: ['teams', 'seasons'],
    });

    if (!league) {
      throw new NotFoundException(`League with ID ${id} not found`);
    }

    return league;
  }

  async update(id: string, updateLeagueDto: UpdateLeagueDto): Promise<League> {
    await this.findOne(id); // Check if exists
    await this.leagueRepository.update(id, updateLeagueDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const league = await this.findOne(id); // Check if exists
    await this.leagueRepository.remove(league);
  }
}
