@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  position: string;

  @ManyToOne(() => Team, team => team.players)
  team: Team;
}
