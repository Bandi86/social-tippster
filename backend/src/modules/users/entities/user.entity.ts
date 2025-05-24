import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum BadgeTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // FK to Team - ezt később fogjuk beállítani amikor a Team entity készen van
  @Column({ type: 'uuid', nullable: true })
  favorite_team: string;

  // FK to AvatarImage - ezt később fogjuk beállítani
  @Column({ type: 'uuid', nullable: true })
  profile_image: string;

  @Column({ type: 'uuid', nullable: true })
  cover_image: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column({ nullable: true })
  website: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: false })
  is_banned: boolean;

  @Column({ type: 'text', nullable: true })
  ban_reason: string | null;

  @Column({ type: 'timestamp', nullable: true })
  banned_until: Date;

  @Column({ type: 'timestamp', nullable: true })
  banned_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ default: 0 })
  login_count: number;

  @Column({ default: false })
  is_premium: boolean;

  @Column({ type: 'timestamp', nullable: true })
  premium_expiration: Date;

  @Column({ unique: true, nullable: true })
  referral_code: string;

  // FK to User - self-referencing
  @Column({ type: 'uuid', nullable: true })
  referred_by: string;

  @Column({ default: 0 })
  referral_count: number;

  @Column({ default: 0 })
  follower_count: number;

  @Column({ default: 0 })
  following_count: number;

  @Column({ default: 0 })
  post_count: number;

  @Column({ default: 0 })
  reputation_score: number;

  @Column({ default: 0 })
  badge_count: number;

  @Column({ type: 'enum', enum: BadgeTier, nullable: true })
  highest_badge_tier: BadgeTier;

  @Column({ default: 0 })
  total_tips: number;

  @Column({ default: 0 })
  successful_tips: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.0 })
  tip_success_rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  total_profit: number;

  @Column({ default: 0 })
  current_streak: number;

  @Column({ default: 0 })
  best_streak: number;

  @Column({ type: 'timestamp', nullable: true })
  email_verified_at: Date;

  @Column({ default: false })
  two_factor_enabled: boolean;

  @Column({ nullable: true })
  timezone: string;

  @Column({ default: 'en' })
  language_preference: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  // FK to User - created by admin/moderator
  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  // Relationships - ezeket később fogjuk implementálni amikor a kapcsolódó entity-k készen vannak
  // @ManyToOne(() => Team, { nullable: true })
  // @JoinColumn({ name: 'favorite_team' })
  // favoriteTeam: Team;

  // @ManyToOne(() => User, { nullable: true })
  // @JoinColumn({ name: 'referred_by' })
  // referredByUser: User;

  // @ManyToOne(() => User, { nullable: true })
  // @JoinColumn({ name: 'created_by' })
  // createdByUser: User;

  // @ManyToOne(() => User, { nullable: true })
  // @JoinColumn({ name: 'updated_by' })
  // updatedByUser: User;
}
