import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Team } from '../../team/entities/team';
import { Season } from '../../season/entities/season';
import { MatchEvent } from './match-event';
import { MatchStat } from './match-stat';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Team)
  homeTeam: Team;

  @ManyToOne(() => Team)
  awayTeam: Team;

  @Column()
  homeScore: number;

  @Column()
  awayScore: number;

  @Column()
  date: Date;

  @ManyToOne(() => Season, (season) => season.matches)
  season: Season;

  @OneToMany(() => MatchEvent, (event) => event.match, { cascade: true })
  events: MatchEvent[];

  @OneToMany(() => MatchStat, (stat) => stat.match, { cascade: true })
  stats: MatchStat[];

  @Column({ nullable: true })
  halfTimeScore: string; // pl. "1-0"

  @Column({ nullable: true })
  fullTimeScore: string; // redundáns, de opcionális
}
