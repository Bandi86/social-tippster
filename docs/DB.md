# Social Tippster Database Plan

## Overview

The goal of this database plan is to outline the structure and organization of the database for the Social Tippster application. This plan will cover the key entities, their relationships, and any important considerations for the database design.

## Entities

1. **User**

   - Attributes:
     - user_id (PK)
     - username (unique)
     - email (unique)
     - password_hash
     - first_name (nullable)
     - last_name (nullable)
     - phone_number (nullable)
     - date_of_birth (date, nullable)
     - gender (enum, nullable)
     - created_at
     - updated_at
     - favorite_team (FK to Team.team_id, nullable)
     - profile_image (FK to AvatarImage.image_id, nullable)
     - cover_image (FK to AvatarImage.image_id, nullable)
     - bio (text, nullable)
     - location (text, nullable)
     - website (url, nullable)
     - is_active (boolean, default true)
     - is_verified (boolean, default false)
     - is_banned (boolean, default false)
     - ban_reason (text, nullable)
     - banned_until (timestamp, nullable)
     - last_login (timestamp, nullable)
     - login_count (integer, default 0)
     - is_premium (boolean, default false)
     - premium_expiration (timestamp, nullable)
     - referral_code (unique, nullable)
     - referred_by (FK, nullable)
     - referral_count (integer, default 0)
     - follower_count (integer, default 0)
     - following_count (integer, default 0)
     - post_count (integer, default 0)
     - reputation_score (integer, default 0)
     - badge_count (integer, default 0)
     - highest_badge_tier (enum: bronze, silver, gold, platinum, diamond, nullable)
     - total_tips (integer, default 0)
     - successful_tips (integer, default 0)
     - tip_success_rate (decimal, default 0.0)
     - total_profit (decimal, default 0.0)
     - current_streak (integer, default 0)
     - best_streak (integer, default 0)
     - email_verified_at (timestamp, nullable)
     - two_factor_enabled (boolean, default false)
     - timezone (varchar, nullable)
     - language_preference (varchar, default 'en')
     - role (enum: user, admin, moderator, default 'user')
     - created_by (FK, nullable)
     - updated_by (FK, nullable)
   - Relationships:
     - Can have a favorite Team (FK to Team entity)
   - Role-based Access Control:
     - USER: Regular user with limited permissions
     - ADMIN: Administrative access for moderation and management
     - MODERATOR: Content moderation capabilities

2. **Post**

   - Attributes:
     - post_id (PK)
     - user_id (FK)
     - title (nullable)
     - content (text)
     - summary (text, nullable)
     - category (enum: tip, discussion, question, news, analysis)
     - subcategory (varchar, nullable)
     - sport_type (enum, nullable)
     - match_id (FK, nullable)
     - odds (decimal, nullable)
     - stake_amount (decimal, nullable)
     - potential_payout (decimal, nullable)
     - confidence_level (integer, 1-10, nullable)
     - created_at
     - updated_at
     - published_at (timestamp, nullable)
     - expires_at (timestamp, nullable)
     - is_published (boolean, default true)
     - is_featured (boolean, default false)
     - is_pinned (boolean, default false)
     - view_count (integer, default 0)
     - like_count (integer, default 0)
     - dislike_count (integer, default 0)
     - comment_count (integer, default 0)
     - share_count (integer, default 0)
     - bookmark_count (integer, default 0)
     - status (enum: active, archived, deleted, pending_review)
     - visibility (enum: public, private, followers_only, premium_only)
     - slug (unique, nullable)
     - meta_title (nullable)
     - meta_description (nullable)
     - reading_time (integer, nullable)
     - created_by (FK, nullable)
     - updated_by (FK, nullable)

3. **Comment**

   - Attributes:
     - comment_id (PK)
     - post_id (FK)
     - user_id (FK)
     - parent_comment_id (FK, nullable)
     - content (text)
     - created_at
     - updated_at
     - is_edited (boolean, default false)
     - edit_count (integer, default 0)
     - like_count (integer, default 0)
     - dislike_count (integer, default 0)
     - reply_count (integer, default 0)
     - is_approved (boolean, default true)
     - is_flagged (boolean, default false)
     - flag_reason (text, nullable)

4. **Vote**

   - Attributes:
     - vote_id (PK)
     - post_id (FK)
     - user_id (FK)
     - value (1 for upvote, -1 for downvote)
     - created_at
     - updated_at

5. **Notification**

   - Attributes:
     - notification_id (PK)
     - user_id (FK)
     - type (enum: comment, vote, mention, follow, message, post_featured, badge_earned, achievement_unlocked)
     - title (varchar)
     - content (text)
     - created_at
     - updated_at
     - read_at (timestamp, nullable)
     - read_status (boolean, default false)
     - related_post_id (FK, nullable)
     - related_comment_id (FK, nullable)
     - related_user_id (FK, nullable)
     - action_url (varchar, nullable)
     - priority (enum: low, medium, high, urgent)

6. **PostTag**

   - Attributes:
     - post_tag_id (PK)
     - post_id (FK)
     - tag_id (FK)
     - created_at
     - updated_at

7. **PostImage**

   - Attributes:
     - image_id (PK)
     - post_id (FK)
     - url
     - created_at
     - updated_at
   - Relationships:
     - Belongs to a Post
     - Can have multiple images associated with a Post

8. **AvatarImage**

   - Attributes:
     - image_id (PK)
     - user_id (FK)
     - url
     - created_at
     - updated_at
   - Relationships:
     - Belongs to a User
     - Used for user profile images

9. **Tag**

   - Attributes:
     - tag_id (PK)
     - name (unique)
     - description (text, nullable)
     - color (varchar, nullable)
     - usage_count (integer, default 0)
     - is_featured (boolean, default false)
     - created_at
     - updated_at
   - Relationships:
     - Can be associated with multiple Posts (through PostTags)
   - Purpose:
     - Master table of all available tags in the system
     - Stores reusable tag information like "football", "basketball", "betting-tips"
     - Acts as a dictionary/catalog of tags

10. **PrivateMessages**

- Attributes:
  - message_id (PK)
  - sender_id (FK)
  - receiver_id (FK)
  - content
  - status (e.g., sent, delivered, read)
  - created_at
  - updated_at
- Relationships:
  - Belongs to a Sender (User)
  - Belongs to a Receiver (User)
  - Can be used for direct messaging between users

11. **UserSettings**

- Attributes:
  - settings_id (PK)
  - user_id (FK)
  - notification_preferences (JSON or similar format)
  - privacy_settings (JSON or similar format)
  - created_at
  - updated_at
- Relationships:
  - Belongs to a User
- Purpose:
  - To store user-specific settings such as notification preferences and privacy settings
  - To allow users to customize their experience within the application

12. ~~**UserRoles**~~ (Replaced by direct role field in User entity)

- ~~Attributes:~~
  - ~~role_id (PK)~~
  - ~~user_id (FK)~~
  - ~~role_name (e.g., admin, moderator, regular_user)~~
  - ~~created_at~~
  - ~~updated_at~~
- ~~Relationships:~~
  - ~~Belongs to a User~~
- ~~Purpose:~~
  - ~~To manage user roles and permissions within the application~~
  - ~~To allow for role-based access control~~
- **Note**: Role management is now implemented directly in the User entity with a role enum field (USER, ADMIN, MODERATOR)

13. **RefreshToken**

- Attributes:
  - token_id (PK)
  - user_id (FK)
  - token (unique, text)
  - expires_at (timestamp)
  - is_revoked (boolean, default false)
  - revoked_at (timestamp, nullable)
  - device_info (text, nullable)
  - ip_address (varchar, nullable)
  - user_agent (text, nullable)
  - created_at
  - updated_at
- Relationships:
  - Belongs to a User (FK to User.user_id)
- Purpose:
  - Store refresh tokens for JWT authentication
  - Enable secure token rotation and session management
  - Track device and location information for security
  - Allow users to revoke tokens from specific devices

14. **UserSessions**

- Attributes:
  - session_id (PK)
  - user_id (FK)
  - token (unique)
  - ip_address (varchar, nullable)
  - user_agent (text, nullable)
  - device_type (enum: desktop, mobile, tablet, nullable)
  - browser (varchar, nullable)
  - location (varchar, nullable)
  - is_active (boolean, default true)
  - expires_at (timestamp)
  - last_activity_at (timestamp)
  - created_at
  - updated_at

15. **ChatGroups**

- Attributes:
  - group_id (PK)
  - group_name
  - description (text, nullable)
  - creator_id (FK)
  - match_id (FK, nullable)
  - group_type (enum: public, private, premium, match_specific)
  - max_members (integer, nullable)
  - member_count (integer, default 0)
  - active_member_count (integer, default 0)
  - is_active (boolean, default true)
  - is_featured (boolean, default false)
  - group_image (FK, nullable)
  - invite_code (unique, nullable)
  - auto_delete_after_match (boolean, default true)
  - created_at
  - updated_at
  - start_date
  - end_date (nullable)
- Purpose:
  - Match-specific chat groups that start before match and end after
  - Public groups visible on match pages with member counts
  - Private groups accessible by invitation only

15. **ChatGroupMembers**

- Attributes:
  - member_id (PK)
  - group_id (FK)
  - user_id (FK)
  - role (enum: admin, moderator, member)
  - joined_at
  - left_at (nullable)
  - is_muted (boolean, default false)
  - is_banned (boolean, default false)
  - last_seen_at (timestamp, nullable)
  - message_count (integer, default 0)

16. **ChatGroupInvitations**

- Attributes:
  - invitation_id (PK)
  - group_id (FK)
  - inviter_id (FK)
  - invitee_id (FK)
  - invitation_message (text, nullable)
  - status (enum: pending, accepted, declined, expired)
  - invited_at
  - responded_at (timestamp, nullable)
  - expires_at (timestamp, nullable)
- Relationships:
  - Belongs to ChatGroup
  - Inviter belongs to User
  - Invitee belongs to User
- Purpose:
  - Track invitations to private chat groups
  - Allow users to invite friends to match discussions

17. **ChatGroupMessages**

- Attributes:
  - message_id (PK)
  - group_id (FK)
  - user_id (FK)
  - content (text)
  - message_type (enum: text, image, system, poll)
  - reply_to_message_id (FK, nullable)
  - is_edited (boolean, default false)
  - edit_count (integer, default 0)
  - is_deleted (boolean, default false)
  - deleted_at (timestamp, nullable)
  - created_at
  - updated_at
- Relationships:
  - Belongs to ChatGroup
  - Belongs to User
  - Can reply to another Message
- Purpose:
  - Store actual chat messages within groups
  - Support threaded conversations and message editing

18. **Team**

- Attributes:
  - team_id (PK)
  - name (unique)
  - short_name (varchar, nullable)
  - logo_image_id (FK to TeamImage.image_id, nullable)
  - sport_type (enum)
  - league (varchar, nullable)
  - country (varchar, nullable)
  - founded_year (integer, nullable)
  - fan_count (integer, default 0)
  - is_active (boolean, default true)
  - created_at
  - updated_at

19. **Match**

- Attributes:
  - match_id (PK)
  - home_team_id (FK)
  - away_team_id (FK)
  - sport_type (enum)
  - league (varchar)
  - match_date (timestamp)
  - venue (varchar, nullable)
  - status (enum: scheduled, live, finished, postponed, cancelled)
  - home_score (integer, nullable)
  - away_score (integer, nullable)
  - created_at
  - updated_at

20. **Follow**

- Attributes:
  - follow_id (PK)
  - follower_id (FK)
  - following_id (FK)
  - created_at
- Relationships:
  - Follower belongs to User
  - Following belongs to User

21. **Bookmark**

- Attributes:
  - bookmark_id (PK)
  - user_id (FK)
  - post_id (FK)
  - created_at
- Relationships:
  - Belongs to User
  - Belongs to Post

22. **CommentVote**

- Attributes:
  - vote_id (PK)
  - comment_id (FK)
  - user_id (FK)
  - value (1 for upvote, -1 for downvote)
  - created_at
- Relationships:
  - Belongs to Comment
  - Belongs to User

23. **PostShare**

- Attributes:
  - share_id (PK)
  - post_id (FK)
  - user_id (FK)
  - platform (enum: facebook, twitter, telegram, whatsapp, direct_link)
  - created_at
- Relationships:
  - Belongs to Post
  - Belongs to User

24. **UserAchievement**

- Attributes:
  - achievement_id (PK)
  - user_id (FK)
  - achievement_type (enum: first_post, 100_followers, verified_tipster, win_streak_5, perfect_week)
  - earned_at
  - points_awarded (integer)
  - badge_awarded_id (FK to Badge.badge_id, nullable)
  - description (text, nullable)
- Relationships:
  - Belongs to User
  - Can trigger Badge award

25. **ChatGroupMessageReactions**

- Attributes:
  - reaction_id (PK)
  - message_id (FK)
  - user_id (FK)
  - emoji (varchar)
  - created_at
- Relationships:
  - Belongs to ChatGroupMessage
  - Belongs to User
- Purpose:
  - Allow users to react to messages with emojis
  - Quick engagement without full replies

26. **Badge**

- Attributes:
  - badge_id (PK)
  - name (unique)
  - description (text)
  - icon_url (varchar)
  - color (varchar, nullable)
  - tier (enum: bronze, silver, gold, platinum, diamond)
  - category (enum: posting, social, betting, achievement, special)
  - points_required (integer, nullable)
  - criteria_type (enum: post_count, follower_count, win_rate, streak, manual)
  - criteria_value (integer, nullable)
  - is_active (boolean, default true)
  - is_limited_time (boolean, default false)
  - available_from (timestamp, nullable)
  - available_until (timestamp, nullable)
  - max_recipients (integer, nullable)
  - current_recipients (integer, default 0)
  - created_at
  - updated_at
- Purpose:
  - Master table of all available badges
  - Examples: "First Post", "100 Followers", "Betting Expert", "Community Helper"
  - Different tiers and categories for varied achievements

27. **UserBadge**

- Attributes:
  - user_badge_id (PK)
  - user_id (FK)
  - badge_id (FK)
  - earned_at
  - is_featured (boolean, default false)
  - awarded_by (FK to User.user_id, nullable)
  - notes (text, nullable)
- Relationships:
  - Belongs to User
  - Belongs to Badge
  - Can be manually awarded by admin/moderator
- Purpose:
  - Junction table tracking which users have earned which badges
  - Users can feature their favorite badges on profile

28. **TeamImage**

- Attributes:
  - image_id (PK)
  - team_id (FK)
  - image_type (enum: logo, banner, uniform)
  - url (varchar)
  - is_primary (boolean, default false)
  - created_at
  - updated_at
- Relationships:
  - Belongs to Team
  - Can have multiple image types per team
- Purpose:
  - Store team logos, banners, and uniform images
  - Support multiple images per team with primary designation

29. **BettingMarket**

- Attributes:
  - market_id (PK)
  - name (unique)
  - description (text, nullable)
  - category (enum: match_winner, over_under, handicap, both_teams_score, correct_score)
  - sport_type (enum)
  - is_active (boolean, default true)
  - created_at
  - updated_at
- Purpose:
  - Define different types of betting markets
  - Examples: "Match Winner", "Over/Under 2.5", "Asian Handicap", "Both Teams to Score"

30. **TipResult**

- Attributes:
  - result_id (PK)
  - post_id (FK)
  - user_id (FK)
  - market_id (FK)
  - predicted_outcome (varchar)
  - actual_outcome (varchar, nullable)
  - status (enum: pending, won, lost, void, partially_won)
  - odds_taken (decimal, nullable)
  - stake_amount (decimal, nullable)
  - profit_loss (decimal, nullable)
  - settled_at (timestamp, nullable)
  - created_at
  - updated_at
- Relationships:
  - Belongs to Post (tip)
  - Belongs to User
  - Belongs to BettingMarket
- Purpose:
  - Track the performance and outcomes of user tips
  - Calculate user statistics and reputation

31. **League**

- Attributes:
  - league_id (PK)
  - name (unique)
  - short_name (varchar, nullable)
  - country (varchar)
  - sport_type (enum)
  - tier (integer, nullable)
  - logo_url (varchar, nullable)
  - season (varchar, nullable)
  - is_active (boolean, default true)
  - created_at
  - updated_at
- Purpose:
  - Better organization of matches by league/competition
  - Examples: "Premier League", "Champions League", "NBA", "NFL"

32. **MatchOdds**

- Attributes:
  - odds_id (PK)
  - match_id (FK)
  - market_id (FK)
  - bookmaker (varchar)
  - outcome (varchar)
  - odds_value (decimal)
  - is_active (boolean, default true)
  - created_at
  - updated_at
- Relationships:
  - Belongs to Match
  - Belongs to BettingMarket
- Purpose:
  - Store odds from different bookmakers for various markets
  - Allow users to compare odds and track changes

33. **Report**

- Attributes:
  - report_id (PK)
  - reporter_id (FK)
  - reported_user_id (FK, nullable)
  - reported_post_id (FK, nullable)
  - reported_comment_id (FK, nullable)
  - reported_message_id (FK, nullable)
  - reason (enum: spam, harassment, inappropriate_content, fake_tips, violation)
  - description (text, nullable)
  - status (enum: pending, investigating, resolved, dismissed)
  - reviewed_by (FK to User.user_id, nullable)
  - reviewed_at (timestamp, nullable)
  - action_taken (text, nullable)
  - created_at
  - updated_at
- Relationships:
  - Reporter belongs to User
  - Can report Users, Posts, Comments, or Messages
- Purpose:
  - Content moderation and community safety
  - Track and resolve user reports

34. **ApiIntegration**

- Attributes:
  - integration_id (PK)
  - provider_name (varchar)
  - api_key_encrypted (varchar)
  - endpoint_url (varchar)
  - service_type (enum: odds_provider, match_data, team_info, news)
  - is_active (boolean, default true)
  - rate_limit (integer, nullable)
  - last_used (timestamp, nullable)
  - usage_count (integer, default 0)
  - created_at
  - updated_at
- Purpose:
  - Manage external API integrations
  - Track usage and rate limits for third-party services

35. **UserTipStats**

- Attributes:
  - stats_id (PK)
  - user_id (FK)
  - sport_type (enum)
  - market_type (FK to BettingMarket.market_id)
  - total_tips (integer, default 0)
  - successful_tips (integer, default 0)
  - success_rate (decimal, default 0.0)
  - total_profit (decimal, default 0.0)
  - avg_odds (decimal, default 0.0)
  - current_streak (integer, default 0)
  - best_streak (integer, default 0)
  - worst_streak (integer, default 0)
  - last_tip_date (timestamp, nullable)
  - updated_at
- Relationships:
  - Belongs to User
  - Belongs to BettingMarket
- Purpose:
  - Detailed statistics per user for different sports and markets
  - Enable leaderboards and performance analysis

36. **Leaderboard**

- Attributes:
  - leaderboard_id (PK)
  - name (varchar)
  - type (enum: overall, sport_specific, market_specific, monthly, weekly)
  - sport_type (enum, nullable)
  - market_id (FK, nullable)
  - period_start (timestamp, nullable)
  - period_end (timestamp, nullable)
  - min_tips_required (integer, default 10)
  - is_active (boolean, default true)
  - created_at
  - updated_at
- Purpose:
  - Different leaderboard categories
  - Time-based competitions and rankings

37. **LeaderboardEntry**

- Attributes:
  - entry_id (PK)
  - leaderboard_id (FK)
  - user_id (FK)
  - rank (integer)
  - score (decimal)
  - tips_count (integer)
  - success_rate (decimal)
  - profit (decimal)
  - calculated_at
- Relationships:
  - Belongs to Leaderboard
  - Belongs to User
- Purpose:
  - Track user positions in various leaderboards
  - Historical ranking data

## Relationships

### Direct Relationships (1-to-Many)

- A User can create multiple Posts
- A User can write multiple Comments
- A User can receive multiple Notifications
- A Post can have multiple Comments
- A Post can have multiple Images
- A User can have multiple Sessions
- A User can have multiple RefreshTokens (for multiple devices/browsers)
- A ChatGroup can have multiple Members
- A Team can play in multiple Matches (as home or away)

### Many-to-Many Relationships (through junction tables)

- **Posts ↔ Tags**:

  - A Post can have multiple Tags (e.g., "football", "premier-league", "betting-tips")
  - A Tag can be used on multiple Posts
  - Junction table: **PostTag** (connects post_id with tag_id)

- **Users ↔ Posts (through Votes)**:

  - A User can vote on multiple Posts
  - A Post can receive votes from multiple Users
  - Junction table: **Vote** (includes vote value: upvote/downvote)

- **Users ↔ Comments (through CommentVotes)**:

  - A User can vote on multiple Comments
  - A Comment can receive votes from multiple Users
  - Junction table: **CommentVote**

- **Users ↔ Posts (through Bookmarks)**:

  - A User can bookmark multiple Posts
  - A Post can be bookmarked by multiple Users
  - Junction table: **Bookmark**

- **Users ↔ Users (through Follow)**:

  - A User can follow multiple Users
  - A User can be followed by multiple Users
  - Junction table: **Follow** (follower_id → following_id)

- **Users ↔ ChatGroups (through ChatGroupMembers)**:
  - A User can join multiple ChatGroups
  - A ChatGroup can have multiple Users
  - Junction table: **ChatGroupMembers** (includes role and status)

### Chat Group System Relationships

- **Match ↔ ChatGroups (1-to-Many)**:

  - Each Match can have multiple ChatGroups (public, private, premium)
  - Users can see all public groups for a match with member counts

- **Users ↔ ChatGroups (through Invitations)**:

  - Users can invite others to private chat groups
  - Track invitation status and expiration

- **ChatGroups ↔ Messages (1-to-Many)**:

  - Each group contains multiple messages
  - Support for threaded conversations and reactions

- **Users ↔ Teams (through favorite_team)**:
  - Each User can have one favorite Team
  - A Team can be favorited by multiple Users
  - Direct foreign key: User.favorite_team → Team.team_id

### Badge System Relationships

- **Users ↔ Badges (through UserBadge)**:

  - A User can earn multiple Badges
  - A Badge can be earned by multiple Users
  - Junction table: **UserBadge** (includes earned_at, featured status)

- **Teams ↔ Images (1-to-Many)**:

  - A Team can have multiple Images (logo, banner, uniform)
  - Each TeamImage belongs to one Team
  - Direct relationship: **TeamImage**

- **Achievements ↔ Badges (1-to-1, optional)**:
  - An Achievement can trigger a Badge award
  - Badges can also be awarded manually by admins

### Betting System Relationships

- **Posts ↔ TipResults (1-to-1)**:

  - Each tip Post can have one TipResult
  - Track the outcome and performance of tips

- **Matches ↔ Leagues (Many-to-1)**:

  - Each Match belongs to one League
  - A League can have multiple Matches

- **Matches ↔ MatchOdds (1-to-Many)**:

  - Each Match can have multiple MatchOdds for different markets
  - Track odds from various bookmakers

- **Users ↔ UserTipStats (1-to-Many)**:
  - Each User can have multiple TipStats for different sports/markets
  - Detailed performance tracking

### Moderation System Relationships

- **Reports ↔ Content (Many-to-1)**:
  - Users can report Posts, Comments, Messages, or other Users
  - Comprehensive content moderation system

### Authorization System

- **User.role (Role-based Access Control)**:
  - Each user has a role (USER, ADMIN, MODERATOR)
  - Roles determine permissions for actions:
    - Users can edit/delete only their own content
    - Admins can delete any content for moderation
    - Moderators have specific content review permissions
  - Permission checks implemented at controller level with guards

### Enhanced Features

- **Leaderboard System**: Multiple leaderboard types with historical tracking
- **Performance Analytics**: Detailed tip performance and user statistics
- **API Management**: External data source integration
- **Market Types**: Comprehensive betting market definitions

## Enhanced Considerations

- **Authentication Security**:
  - RefreshToken table enables secure JWT token rotation
  - Device tracking for multi-device session management
  - Token revocation for security incidents
  - Automatic cleanup of expired tokens
- **Authorization System**:
  - Role-based access control with USER, ADMIN, and MODERATOR roles
  - Permission enforcement at controller level
  - Endpoint-specific authorization rules:
    - Users can only modify their own profiles and posts
    - Admins can delete any post for moderation purposes
    - Clear separation of administrative functions
- **Data Integrity**: Add constraints for tip success rates (0-1), odds (positive values)
- **Performance Optimization**: Index leaderboard queries, tip statistics, and match searches
- **Real-time Updates**: Consider caching for leaderboards and user statistics
- **Privacy**: Encrypt sensitive API keys and personal data
- **Audit Trail**: Track changes to tip results and user statistics
- **Rate Limiting**: API usage tracking and limits
- **Data Validation**: Ensure tip outcomes match actual match results

## Conclusion

This enhanced database plan provides comprehensive coverage of the Social Tippster application's data needs with additional fields for analytics, security, and user experience improvements.

## Database Schema Reference

### User Entity (Current Implementation)

```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  phone_number VARCHAR,
  date_of_birth DATE,
  gender VARCHAR,
  bio TEXT,
  location TEXT,
  website VARCHAR,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  banned_until TIMESTAMP,
  banned_at TIMESTAMP,
  verified_at TIMESTAMP,
  last_login TIMESTAMP,
  login_count INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expiration TIMESTAMP,
  referral_code VARCHAR UNIQUE,
  referred_by UUID REFERENCES users(user_id),
  referral_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  badge_count INTEGER DEFAULT 0,
  highest_badge_tier VARCHAR,
  total_tips INTEGER DEFAULT 0,
  successful_tips INTEGER DEFAULT 0,
  tip_success_rate DECIMAL(5,4) DEFAULT 0.0,
  total_profit DECIMAL(10,2) DEFAULT 0.0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  email_verified_at TIMESTAMP,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  timezone VARCHAR,
  language_preference VARCHAR DEFAULT 'en',
  role VARCHAR(20) DEFAULT 'user' NOT NULL,
  created_by UUID REFERENCES users(user_id),
  updated_by UUID REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimized queries
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Post Entity (Current Implementation)

```sql
CREATE TABLE posts (
  post_id UUID PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES users(user_id),
  title VARCHAR,
  content TEXT NOT NULL,
  category VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimized queries
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category);
```

## [2025-05-29] Seed Script Added

A new seed script (`backend/src/database/seed.ts`) is available to quickly populate the database with sample data for all main entities (users, posts, interactions, analytics, etc.).

- Run with: `npx ts-node backend/src/database/seed.ts`
- Populates 2-3 records per table for development/demo
- Uses `.env` for DB connection
