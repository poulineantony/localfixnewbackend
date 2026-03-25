import { Module } from '@nestjs/common';
import { NewLanguagesController } from './new-languages.controller';
import { NewLanguagesService } from './new-languages.service';

@Module({
  controllers: [NewLanguagesController],
  providers: [NewLanguagesService],
  exports: [NewLanguagesService],
})
export class NewLanguagesModule {}
