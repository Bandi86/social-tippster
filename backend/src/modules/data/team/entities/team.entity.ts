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
import { Player } from '../../player/entities/player.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  shortName: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  founded: number;

  @Column({ nullable: true })
  venue: string;

  @Column({ nullable: true })
  venueCapacity: number;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => League, league => league.teams)
  league: League;

  @OneToMany(() => Player, player => player.team)
  players: Player[];

  @OneToMany(() => Match, match => match.homeTeam)
  homeMatches: Match[];

  @OneToMany(() => Match, match => match.awayTeam)
  awayMatches: Match[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
