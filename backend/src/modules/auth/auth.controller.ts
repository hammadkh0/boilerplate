import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { COOKIE_NAMES } from '../shared/constants';
import { CurrentUser, Public } from '../shared/decorators';
import type { AuthUser } from '../shared/types';
import { AuthService } from './auth.service';
import { AUTH_MESSAGES, AUTH_THROTTLE } from './constants';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto';
import { readCookie } from './helpers';

@ApiTags('auth')
@Controller('auth')
@Throttle(AUTH_THROTTLE)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an account and send a verification email' })
  @ApiOkResponse({ description: AUTH_MESSAGES.REGISTERED })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark an email as verified with a one-time token' })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send another verification email' })
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in and set the access and refresh cookies' })
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(dto.email, dto.password, response);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the refresh cookie and issue a new access cookie' })
  refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.authService.refresh(
      readCookie(request.cookies, COOKIE_NAMES.REFRESH_TOKEN),
      response,
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Clear the session cookies and the stored refresh hash' })
  logout(@CurrentUser() user: AuthUser, @Res({ passthrough: true }) response: Response) {
    return this.authService.logout(user, response);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a password reset link when the email exists' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a new password with a one-time reset token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Change the signed-in user password and rotate the session' })
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.changePassword(user, dto, response);
  }

  @Get('me')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Return the signed-in user' })
  me(@CurrentUser() user: AuthUser) {
    return this.authService.getMe(user.id);
  }
}
