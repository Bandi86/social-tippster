import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Match } from './match';

@Entity()
export class MatchEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Match, match => match.events)
  match: Match;

  @Column()
  minute: number;

  @Column()
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution';

  @Column({ nullable: true })
  playerName: string;

  @Column({ nullable: true })
  assistBy: string;

  @Column({ nullable: true })
  teamId: number;
}
