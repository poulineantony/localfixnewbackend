import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NewAuthService } from './new-auth.service';

@Controller()
export class NewAuthController {
  constructor(private readonly newAuthService: NewAuthService) {}

  @Post('/new/auth/mobile/request-otp')
  requestOtp(@Body() body: { phone: string; [key: string]: any }) {
    return this.newAuthService.requestOtp(body.phone, body);
  }

  @Post('/new/auth/mobile/verify-otp')
  verifyOtp(
    @Body() body: { phone: string; otp: string; [key: string]: any },
  ) {
    return this.newAuthService.verifyOtp(body.phone, body.otp, body);
  }

  @Post('/new/auth/refresh')
  refresh(@Body() body: { refreshToken: string }) {
    return this.newAuthService.refresh(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/new/auth/me')
  getMe(@CurrentUser() user: any) {
    return this.newAuthService.getMe(user.userId);
  }
}
