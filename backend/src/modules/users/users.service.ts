import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email: createUserDto.email }, { username: createUserDto.username }],
    });

    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('Ez az email cím már regisztrálva van');
      }
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('Ez a felhasználónév már foglalt');
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create user entity
    const user = this.userRepository.create({
      ...createUserDto,
      password_hash: hashedPassword,
      is_active: true,
      is_verified: false,
      is_banned: false,
      is_premium: false,
      follower_count: 0,
      following_count: 0,
      post_count: 0,
      reputation_score: 0,
      total_tips: 0,
      successful_tips: 0,
      tip_success_rate: 0,
      current_streak: 0,
      best_streak: 0,
      total_profit: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const savedUser = await this.userRepository.save(user);
    return plainToInstance(UserResponseDto, savedUser);
  }

  // Internal method for auth service - returns actual User entity
  async createUserEntity(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email: createUserDto.email }, { username: createUserDto.username }],
    });

    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('Ez az email cím már regisztrálva van');
      }
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('Ez a felhasználónév már foglalt');
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create user entity
    const user = this.userRepository.create({
      ...createUserDto,
      password_hash: hashedPassword,
      is_active: true,
      is_verified: false,
      is_banned: false,
      is_premium: false,
      follower_count: 0,
      following_count: 0,
      post_count: 0,
      reputation_score: 0,
      total_tips: 0,
      successful_tips: 0,
      tip_success_rate: 0,
      current_streak: 0,
      best_streak: 0,
      total_profit: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await this.userRepository.save(user);
  }

  async findAll(queryDto: GetUsersQueryDto): Promise<{
    users: UserResponseDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { page = 1, limit = 10, search, sortBy = 'created_at', sortOrder = 'DESC' } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Add search functionality
    if (search) {
      queryBuilder.where(
        'user.username ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search',
        { search: `%${search}%` },
      );
    }

    // Add sorting
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    // Add pagination
    queryBuilder.skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    const transformedUsers = users.map(user => plainToInstance(UserResponseDto, user));

    return {
      users: transformedUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });

    if (!user) {
      throw new NotFoundException('Felhasználó nem található');
    }

    return plainToInstance(UserResponseDto, user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new NotFoundException('Felhasználó nem található');
    }

    return plainToInstance(UserResponseDto, user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });

    if (!user) {
      throw new NotFoundException('Felhasználó nem található');
    }

    // Check for username conflict if username is being updated
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });

      if (existingUser) {
        throw new ConflictException('Ez a felhasználónév már foglalt');
      }
    }

    // Update user
    Object.assign(user, updateUserDto);
    user.updated_at = new Date();

    const savedUser = await this.userRepository.save(user);
    return plainToInstance(UserResponseDto, savedUser);
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { user_id: id },
    });

    if (!user) {
      throw new NotFoundException('Felhasználó nem található');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password_hash,
    );
    if (!isCurrentPasswordValid) {
      throw new ForbiddenException('Jelenlegi jelszó helytelen');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, saltRounds);

    user.password_hash = hashedNewPassword;
    await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });

    if (!user) {
      throw new NotFoundException('Felhasználó nem található');
    }

    await this.userRepository.remove(user);
  }

  async banUser(id: string, reason?: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });

    if (!user) {
      throw new NotFoundException('Felhasználó nem található');
    }

    user.is_banned = true;
    user.ban_reason = reason || null;
    user.banned_at = new Date();
    user.updated_at = new Date();

    const savedUser = await this.userRepository.save(user);
    return plainToInstance(UserResponseDto, savedUser);
  }

  async unbanUser(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });

    if (!user) {
      throw new NotFoundException('Felhasználó nem található');
    }

    user.is_banned = false;
    user.ban_reason = null;
    user.banned_at = null;
    user.updated_at = new Date();

    const savedUser = await this.userRepository.save(user);
    return plainToInstance(UserResponseDto, savedUser);
  }

  async verifyUser(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });

    if (!user) {
      throw new NotFoundException('Felhasználó nem található');
    }

    user.is_verified = true;
    user.verified_at = new Date();
    user.updated_at = new Date();

    const savedUser = await this.userRepository.save(user);
    return plainToInstance(UserResponseDto, savedUser);
  }

  async unverifyUser(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });

    if (!user) {
      throw new NotFoundException('Felhasználó nem található');
    }

    user.is_verified = false;
    user.verified_at = null;
    user.updated_at = new Date();

    const savedUser = await this.userRepository.save(user);
    return plainToInstance(UserResponseDto, savedUser);
  }

  async changeUserRole(id: string, role: UserRole): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });

    if (!user) {
      throw new NotFoundException('Felhasználó nem található');
    }

    // Prevent changing the role of the current user if they are the only admin
    if (user.role === UserRole.ADMIN && role !== UserRole.ADMIN) {
      const adminCount = await this.userRepository.count({
        where: { role: UserRole.ADMIN },
      });

      if (adminCount <= 1) {
        throw new BadRequestException('Nem lehet eltávolítani az egyetlen admin jogosultságot');
      }
    }

    user.role = role;
    user.updated_at = new Date();

    const savedUser = await this.userRepository.save(user);
    return plainToInstance(UserResponseDto, savedUser);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      return user;
    }

    return null;
  }

  async incrementFollowerCount(id: string): Promise<void> {
    await this.userRepository.increment({ user_id: id }, 'followers_count', 1);
  }

  async decrementFollowerCount(id: string): Promise<void> {
    await this.userRepository.decrement({ user_id: id }, 'followers_count', 1);
  }

  async updateTipStats(id: string, isSuccessful: boolean, profit?: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });

    if (!user) {
      throw new NotFoundException('Felhasználó nem található');
    }

    user.total_tips += 1;

    if (isSuccessful) {
      user.successful_tips += 1;
      user.current_streak += 1;
      if (user.current_streak > user.best_streak) {
        user.best_streak = user.current_streak;
      }
    } else {
      user.current_streak = 0;
    }

    user.tip_success_rate = (user.successful_tips / user.total_tips) * 100;

    if (profit !== undefined) {
      user.total_profit += profit;
    }

    user.updated_at = new Date();
    await this.userRepository.save(user);
  }

  // Make mapToResponseDto public for use in controller
  mapToResponseDto(user: User): UserResponseDto {
    return plainToInstance(UserResponseDto, user);
  }
}
