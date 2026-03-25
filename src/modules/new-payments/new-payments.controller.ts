import { Controller, Get, Query } from '@nestjs/common';
import { NewPaymentsService } from './new-payments.service';

@Controller('/new/payment-methods')
export class NewPaymentsController {
  constructor(private readonly newPaymentsService: NewPaymentsService) {}

  @Get()
  list(@Query('language') language?: string) {
    return this.newPaymentsService.list(language);
  }
}
