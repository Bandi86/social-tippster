import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Team } from '../../team/entities/team';
import { Season } from '../../season/entities/season';

@Entity()
export class League {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  website: string;

  @OneToMany(() => Team, (team) => team.league)
  teams: Team[];

  @OneToMany(() => Season, (season) => season.league)
  seasons: Season[];
}

