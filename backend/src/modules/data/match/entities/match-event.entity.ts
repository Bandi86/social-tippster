import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Match } from './match.entity';

export enum MatchEventType {
  GOAL = 'goal',
  YELLOW_CARD = 'yellow_card',
  RED_CARD = 'red_card',
  SUBSTITUTION = 'substitution',
  PENALTY = 'penalty',
  OWN_GOAL = 'own_goal',
}

@Entity('match_events')
export class MatchEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Match, match => match.events)
  match: Match;

  @Column()
  minute: number;

  @Column({
    type: 'enum',
    enum: MatchEventType,
  })
  type: MatchEventType;

  @Column({ nullable: true })
  playerName: string;

  @Column({ nullable: true })
  assistBy: string;

  @Column({ nullable: true })
  teamId: number;

  @Column({ nullable: true })
  description: string;
}
