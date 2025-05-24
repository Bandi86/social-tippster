import { Exclude } from 'class-transformer';
import { BadgeTier, Gender } from '../entities/user.entity';

export class UserResponseDto {
  user_id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  date_of_birth?: Date;
  gender?: Gender;
  created_at: Date;
  updated_at: Date;

  // Profile related
  favorite_team?: string;
  profile_image?: string;
  cover_image?: string;
  bio?: string;
  location?: string;
  website?: string;

  // Status and verification
  is_active: boolean;
  is_verified: boolean;
  is_premium: boolean;
  premium_expiration?: Date;
  email_verified_at?: Date;
  two_factor_enabled: boolean;

  // Referral system
  referral_code?: string;
  referred_by?: string;
  referral_count: number;

  // Social counts
  follower_count: number;
  following_count: number;
  post_count: number;

  // Reputation and achievements
  reputation_score: number;
  badge_count: number;
  highest_badge_tier?: BadgeTier;

  // Betting statistics
  total_tips: number;
  successful_tips: number;
  tip_success_rate: number;
  total_profit: number;
  current_streak: number;
  best_streak: number;

  // Login tracking
  last_login?: Date;
  login_count: number;

  // Preferences
  timezone?: string;
  language_preference: string;

  // Ezeket SOHA nem küldjük vissza a kliensnek
  @Exclude()
  password_hash: string;

  @Exclude()
  is_banned: boolean;

  @Exclude()
  ban_reason?: string;

  @Exclude()
  banned_until?: Date;

  @Exclude()
  created_by?: string;

  @Exclude()
  updated_by?: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
