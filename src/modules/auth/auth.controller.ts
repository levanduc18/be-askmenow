import { Controller, Post, Body, Res, Req, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from '@/modules/auth/auth.service';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { GoogleAuthGuard } from '@/modules/auth/guards/google-auth.guard';
import { Public } from '@/modules/auth/passport/is-public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  login(@Res({ passthrough: true }) res: Response, @Body() loginDto: LoginDto) {
    return this.authService.login(res, loginDto);
  }

  @Public()
  @Post('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin(@Body('idToken') idToken: string, @Res() res: Response) {
    return this.authService.loginWithGoogle(idToken, res);
  }

  @Public()
  @Post('refresh-token')
  refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(res, req.cookies?.refreshToken);
  }

  @Public()
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(res, req.cookies?.refreshToken);
  }
}
