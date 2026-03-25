import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NewAuthService } from '../new-auth/new-auth.service';
import { NewLanguagesService } from '../new-languages/new-languages.service';
import { NewTranslationsService } from '../new-translations/new-translations.service';
import { LegacyService } from './legacy.service';

@Controller()
export class LegacyController {
  constructor(
    private readonly legacyService: LegacyService,
    private readonly newAuthService: NewAuthService,
    private readonly newLanguagesService: NewLanguagesService,
    private readonly newTranslationsService: NewTranslationsService,
  ) {}

  @Get('/config')
  getConfig() {
    return this.legacyService.getConfig();
  }

  @Post('/auth/send-otp')
  sendOtp(@Body() body: { phone: string; [key: string]: any }) {
    return this.newAuthService.requestOtp(body.phone, body);
  }

  @Post('/auth/verify-otp')
  verifyOtp(@Body() body: { phone: string; otp: string; [key: string]: any }) {
    return this.newAuthService.verifyOtp(body.phone, body.otp, body);
  }

  @Post('/auth/refresh')
  refresh(@Body() body: { refreshToken: string }) {
    return this.newAuthService.refresh(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/auth/me')
  getMe(@Req() request: any) {
    return this.newAuthService.getMe(request.user.userId);
  }

  @Get('/translations/languages')
  listTranslationLanguages() {
    return this.newLanguagesService.list();
  }

  @Get('/translations/:language')
  getTranslations(@Param('language') language: string) {
    return this.newTranslationsService.getActive(language);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/devices/register')
  registerDevice(@Req() request: any, @Body() body: Record<string, any>) {
    return this.legacyService.registerDevice(request.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/users/profile')
  updateProfile(@Req() request: any, @Body() body: Record<string, any>) {
    return this.legacyService.updateProfile(request.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/users/profile/addresses')
  getSavedAddresses(@Req() request: any) {
    return this.legacyService.getSavedAddresses(request.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/users/profile/addresses')
  addSavedAddress(@Req() request: any, @Body() body: Record<string, any>) {
    return this.legacyService.addSavedAddress(request.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/users/profile/addresses/:addressId')
  updateSavedAddress(
    @Req() request: any,
    @Param('addressId') addressId: string,
    @Body() body: Record<string, any>,
  ) {
    return this.legacyService.updateSavedAddress(
      request.user.userId,
      addressId,
      body,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/users/profile/addresses/:addressId')
  deleteSavedAddress(
    @Req() request: any,
    @Param('addressId') addressId: string,
  ) {
    return this.legacyService.deleteSavedAddress(request.user.userId, addressId);
  }

  @Get('/services')
  getServices(@Query() query: Record<string, string>) {
    return this.legacyService.getServices(query);
  }

  @Get('/services/:serviceId')
  getServiceById(@Param('serviceId') serviceId: string) {
    return this.legacyService.getServiceById(serviceId);
  }

  @Get('/services/categories/list')
  getServiceCategories() {
    return this.legacyService.getServiceCategories();
  }

  @Get('/services/categories/catalog')
  getServiceCategoryCatalog(@Query() query: Record<string, string>) {
    return this.legacyService.getServiceCategoryCatalog(query);
  }

  @Get('/providers')
  getProviders(@Query() query: Record<string, string>) {
    return this.legacyService.getProviders(query);
  }

  @Get('/providers/:providerId')
  getProviderById(@Param('providerId') providerId: string) {
    return this.legacyService.getProviderById(providerId);
  }

  @Get('/reviews')
  getReviews(@Query() query: Record<string, string>) {
    return this.legacyService.getReviews(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/bookings')
  getBookings(@Req() request: any, @Query() query: Record<string, string>) {
    return this.legacyService.getBookings(request.user.userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/bookings/:bookingId')
  getBookingById(@Req() request: any, @Param('bookingId') bookingId: string) {
    return this.legacyService.getBookingById(request.user.userId, bookingId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/bookings/checkout/quote')
  getBookingQuote(@Body() body: { service: string; additionalServices?: string[] }) {
    return this.legacyService.getBookingQuote(body.service, body.additionalServices || []);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/bookings/checkout/order')
  createCheckoutOrder(@Req() request: any, @Body() body: Record<string, any>) {
    return this.legacyService.createCheckoutOrder(request.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/bookings/checkout/verify')
  verifyCheckoutPayment(@Req() request: any, @Body() body: Record<string, any>) {
    return this.legacyService.verifyCheckoutPayment(request.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/bookings/:bookingId/cancel')
  cancelBooking(
    @Req() request: any,
    @Param('bookingId') bookingId: string,
    @Body() body: { reason?: string },
  ) {
    return this.legacyService.cancelBooking(
      request.user.userId,
      bookingId,
      body.reason,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/bookings/:bookingId/status')
  updateBookingStatus(
    @Req() request: any,
    @Param('bookingId') bookingId: string,
    @Body() body: { status: string },
  ) {
    return this.legacyService.updateBookingStatus(
      request.user.userId,
      bookingId,
      body.status,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/notifications/sos/:bookingId')
  triggerSos(
    @Req() request: any,
    @Param('bookingId') bookingId: string,
    @Body() body: { message?: string },
  ) {
    return this.legacyService.triggerSos(
      request.user.userId,
      bookingId,
      body.message,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/bookings/:bookingId/materials')
  getBookingMaterials(
    @Req() request: any,
    @Param('bookingId') bookingId: string,
  ) {
    return this.legacyService.getBookingMaterials(request.user.userId, bookingId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/bookings/:bookingId/invoice')
  getBookingInvoice(
    @Req() request: any,
    @Param('bookingId') bookingId: string,
  ) {
    return this.legacyService.getBookingInvoice(request.user.userId, bookingId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/disputes')
  raiseDispute(@Req() request: any, @Body() body: Record<string, any>) {
    return this.legacyService.raiseDispute(request.user.userId, body);
  }
}
