import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { NewTranslationsService } from './new-translations.service';

@Controller('/new/translations')
export class NewTranslationsController {
  constructor(
    private readonly newTranslationsService: NewTranslationsService,
  ) {}

  @Get('/active')
  getActive(@Query('language') language?: string) {
    return this.newTranslationsService.getActive(language);
  }

  @Get()
  getAll(@Query('language') language?: string) {
    return this.newTranslationsService.getAll(language);
  }

  @Post('/import')
  import(@Body() body: { entries?: Array<Record<string, any>> }) {
    return this.newTranslationsService.import(body.entries || []);
  }
}
