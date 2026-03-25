import { Controller, Get, Query } from '@nestjs/common';
import { NewLegalService } from './new-legal.service';

@Controller('/new/legal-documents')
export class NewLegalController {
  constructor(private readonly newLegalService: NewLegalService) {}

  @Get()
  list(@Query('language') language?: string) {
    return this.newLegalService.list(language);
  }
}
