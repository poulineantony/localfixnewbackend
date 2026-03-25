import {
  Controller,
  Get,
  Headers,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NewBootstrapService } from './new-bootstrap.service';

@Controller('/new/app')
export class NewBootstrapController {
  constructor(private readonly newBootstrapService: NewBootstrapService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/bootstrap')
  getBootstrap(
    @Req() request: any,
    @Headers('accept-language') acceptLanguage?: string,
    @Query('language') language?: string,
  ) {
    return this.newBootstrapService.getBootstrap(
      request.user?.userId,
      language || acceptLanguage || 'en',
    );
  }
}
