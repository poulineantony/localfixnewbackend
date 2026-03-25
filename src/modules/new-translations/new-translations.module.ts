import { Module } from '@nestjs/common';
import { NewTranslationsController } from './new-translations.controller';
import { NewTranslationsService } from './new-translations.service';

@Module({
  controllers: [NewTranslationsController],
  providers: [NewTranslationsService],
  exports: [NewTranslationsService],
})
export class NewTranslationsModule {}
