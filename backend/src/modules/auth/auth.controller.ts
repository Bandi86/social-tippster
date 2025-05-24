import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCookieAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginResponse } from './interfaces/login-response.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Felhasználó regisztráció',
    description: 'Új felhasználó létrehozása az alkalmazásban',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Sikeres regisztráció',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Sikeres regisztráció' },
        user: {
          type: 'object',
          properties: {
            user_id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Hibás adatok' })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<any> {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Regisztráció sikertelen');
    }
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 login attempt per minute
  @ApiOperation({
    summary: 'Bejelentkezés',
    description: 'Felhasználó bejelentkezés email és jelszó használatával',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Sikeres bejelentkezés',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: 'JWT access token' },
        user: {
          type: 'object',
          properties: {
            user_id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Hibás email vagy jelszó' })
  @ApiTooManyRequestsResponse({ description: 'Túl sok bejelentkezési kísérlet' })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponse> {
    return this.authService.login(loginDto, response);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Token frissítés',
    description: 'Access token frissítése refresh token használatával',
  })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({
    status: 200,
    description: 'Token sikeresen frissítve',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: 'Új JWT access token' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Érvénytelen refresh token' })
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ access_token: string }> {
    const refreshToken = request.cookies?.refreshToken as string;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token hiányzik');
    }

    return this.authService.refreshToken(refreshToken, response);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Kijelentkezés',
    description: 'Jelenlegi eszközről való kijelentkezés',
  })
  @ApiResponse({ status: 200, description: 'Sikeres kijelentkezés' })
  @ApiUnauthorizedResponse({ description: 'Nem authentikált felhasználó' })
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    return this.authService.logout(user.user_id, response);
  }

  @Post('logout-all-devices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Kijelentkezés minden eszközről',
    description: 'Összes eszközről való kijelentkezés (minden refresh token invalidálása)',
  })
  @ApiResponse({ status: 200, description: 'Sikeres kijelentkezés minden eszközről' })
  @ApiUnauthorizedResponse({ description: 'Nem authentikált felhasználó' })
  @HttpCode(HttpStatus.OK)
  async logoutAllDevices(@CurrentUser() user: User): Promise<{ message: string }> {
    return this.authService.logoutAllDevices(user.user_id);
  }
}
