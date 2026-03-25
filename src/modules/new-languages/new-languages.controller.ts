import { Controller, Get, Post } from '@nestjs/common';
import { NewLanguagesService } from './new-languages.service';

@Controller('/new/languages')
export class NewLanguagesController {
  constructor(private readonly newLanguagesService: NewLanguagesService) {}

  @Get()
  list() {
    return this.newLanguagesService.list();
  }

  @Post('/seed')
  seed() {
    return this.newLanguagesService.seed();
  }
}
