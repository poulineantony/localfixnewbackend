import { Module } from '@nestjs/common';
import { NewAuthModule } from '../new-auth/new-auth.module';
import { NewLanguagesModule } from '../new-languages/new-languages.module';
import { NewTranslationsModule } from '../new-translations/new-translations.module';
import { LegacyController } from './legacy.controller';
import { LegacyService } from './legacy.service';

@Module({
  imports: [NewAuthModule, NewLanguagesModule, NewTranslationsModule],
  controllers: [LegacyController],
  providers: [LegacyService],
})
export class LegacyModule {}
