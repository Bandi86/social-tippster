

@Entity()
export class MatchStat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Match, (match) => match.stats)
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
}
