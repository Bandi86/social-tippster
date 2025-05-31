import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { League } from '../../league/entities/league.entity';
import { Match } from '../../match/entities/match.entity';

@Entity('seasons')
export class Season {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  yearStart: number; // 2024

  @Column()
  yearEnd: number; // 2025

  @Column({ nullable: true })
  name: string; // e.g., "2024/25 Season"

  @Column({ nullable: true })
  winner: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @ManyToOne(() => League, league => league.seasons)
  league: League;

  @OneToMany(() => Match, match => match.season)
  matches: Match[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
