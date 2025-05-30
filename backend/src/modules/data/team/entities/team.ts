

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => League, league => league.teams)
  league: League;

  @OneToMany(() => Player, player => player.team)
  players: Player[];

  @OneToMany(() => Match, match => match.homeTeam)
  homeMatches: Match[];

  @OneToMany(() => Match, match => match.awayTeam)
  awayMatches: Match[];
}
