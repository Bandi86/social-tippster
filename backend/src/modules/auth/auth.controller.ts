import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthThrottle, Throttle } from '../auth/decorators/throttle.decorator';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { LogoutDto, RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @AuthThrottle() // 5 requests per minute
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad Request - validation failed' })
  @ApiResponse({ status: 409, description: 'Conflict - user already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Sikeres bejelentkezes' })
  @ApiResponse({ status: 400, description: 'Bad Request - Hianyzo email vagy jelszo' })
  @ApiResponse({ status: 401, description: 'Unauthorized - ervenytelen hitelesites' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    if (!loginDto.email || !loginDto.password) {
      throw new BadRequestException('Az email és a jelszó megadása kötelező');
    }
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Hibás email vagy jelszó');
    }
    // Return 201 on successful login
    const result = await this.authService.login(loginDto, req);
    return result;
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Frissíti a hozzáférési tokent' })
  @ApiResponse({ status: 200, description: 'A hozzáférési token sikeresen frissítve' })
  @ApiResponse({ status: 401, description: 'Unauthorized - érvénytelen frissítő token' })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshTokenDto> {
    const refreshToken = (req.cookies?.refresh_token as string) || '';
    return await this.authService.refreshToken(refreshToken, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Felhasználó sikeresen kijelentkezett' })
  @ApiResponse({ status: 401, description: 'Unauthorized - token hiányzik' })
  async logout(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Extract refresh token from request or cookie
    const cookies = req.cookies as Record<string, unknown> | undefined;
    const body = req.body as Record<string, unknown> | undefined;
    const refreshToken =
      (typeof cookies?.refresh_token === 'string' ? cookies.refresh_token : '') ||
      (typeof body?.refresh_token === 'string' ? body.refresh_token : '');

    if (!refreshToken) {
      return { message: 'Már ki van jelentkezve' };
    }

    const logoutDto: LogoutDto = { refresh_token: refreshToken };

    return await this.authService.logout(logoutDto, user.user_id, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Sikeres kijelentkezés minden eszközről' })
  @ApiResponse({
    status: 200,
    description: 'Felhasználó sikeresen kijelentkezett minden eszközről',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - token hiányzik' })
  async logoutAllDevices(@CurrentUser() user: User) {
    return await this.authService.logoutAllDevices(user.user_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'bejelentkezett felhasználó' })
  @ApiResponse({ status: 200, description: 'A bejelentkezett felhasználó profilja' })
  @ApiResponse({ status: 401, description: 'Unauthorized - token hiányzik' })
  getProfile(@CurrentUser() user: User) {
    return user;
  }
}
