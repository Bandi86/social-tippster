import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Season } from '../../season/entities/season.entity';
import { Team } from '../../team/entities/team.entity';
import { MatchEvent } from './match-event.entity';
import { MatchStat } from './match-stat.entity';

export enum MatchStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  FINISHED = 'finished',
  POSTPONED = 'postponed',
  CANCELLED = 'cancelled',
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  homeTeamId: string;

  @Column({ type: 'uuid' })
  awayTeamId: string;

  @ManyToOne(() => Team, { eager: true })
  @JoinColumn({ name: 'homeTeamId' })
  homeTeam: Team;

  @ManyToOne(() => Team, { eager: true })
  @JoinColumn({ name: 'awayTeamId' })
  awayTeam: Team;

  @Column({ type: 'int', default: 0 })
  homeScore: number;

  @Column({ type: 'int', default: 0 })
  awayScore: number;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.SCHEDULED,
  })
  status: MatchStatus;

  @ManyToOne(() => Season, season => season.matches)
  season: Season;

  @OneToMany(() => MatchEvent, event => event.match, { cascade: true })
  events: MatchEvent[];

  @OneToMany(() => MatchStat, stat => stat.match, { cascade: true })
  stats: MatchStat[];

  @Column({ type: 'varchar', length: 10, nullable: true })
  halfTimeScore: string; // pl. "1-0"

  @Column({ type: 'varchar', length: 10, nullable: true })
  fullTimeScore: string; // redundáns, de opcionális

  @Column({ type: 'int', nullable: true })
  minute: number; // current minute for live matches

  @Column({ type: 'varchar', length: 255, nullable: true })
  venue: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referee: string;

  @Column({ type: 'int', nullable: true })
  attendance: number;

  @Column({ type: 'text', nullable: true })
  weather: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
