import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NewProvidersService } from './new-providers.service';

@Controller('/new/providers')
export class NewProvidersController {
  constructor(private readonly newProvidersService: NewProvidersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  getMe(@CurrentUser() user: any) {
    return this.newProvidersService.getMe(user.userId);
  }

  @Get('/staff')
  getStaff() {
    return this.newProvidersService.getStaff();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/bookings')
  getBookings(
    @CurrentUser() user: any,
    @Headers('x-provider-id') providerId?: string,
  ) {
    return this.newProvidersService.getBookings(user.userId, providerId);
  }
}
