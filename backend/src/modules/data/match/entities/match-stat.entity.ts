import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Match } from './match.entity';

@Entity('match_stats')
export class MatchStat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Match, match => match.stats)
  match: Match;

  @Column()
  teamType: 'home' | 'away';

  @Column()
  possession: number; // százalékban

  @Column()
  shots: number;

  @Column()
  shotsOnTarget: number;

  @Column()
  corners: number;

  @Column()
  fouls: number;

  @Column({ nullable: true })
  yellowCards: number;

  @Column({ nullable: true })
  redCards: number;

  @Column({ nullable: true })
  offsides: number;
}
