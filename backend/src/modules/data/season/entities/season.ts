import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { League } from '../../league/entities/league';

@Entity()
export class Season {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  yearStart: number; // 2024

  @Column()
  yearEnd: number;   // 2025

  @Column({ nullable: true })
  winner: string;

  @ManyToOne(() => League, (league) => league.seasons)
  league: League;
}
