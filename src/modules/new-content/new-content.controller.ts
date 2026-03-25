import { Controller, Get, Query } from '@nestjs/common';
import { NewContentService } from './new-content.service';

@Controller('/new/content')
export class NewContentController {
  constructor(private readonly newContentService: NewContentService) {}

  @Get('/home')
  getHome(@Query('language') language?: string) {
    return this.newContentService.getHome(language);
  }
}
