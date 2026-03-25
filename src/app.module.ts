import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { NewAuthModule } from './modules/new-auth/new-auth.module';
import { NewLanguagesModule } from './modules/new-languages/new-languages.module';
import { NewTranslationsModule } from './modules/new-translations/new-translations.module';
import { NewContentModule } from './modules/new-content/new-content.module';
import { NewLegalModule } from './modules/new-legal/new-legal.module';
import { NewPaymentsModule } from './modules/new-payments/new-payments.module';
import { NewBootstrapModule } from './modules/new-bootstrap/new-bootstrap.module';
import { NewProvidersModule } from './modules/new-providers/new-providers.module';
import { LegacyModule } from './modules/legacy/legacy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET || 'localfixnew-access-secret',
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
      },
    }),
    PrismaModule,
    NewAuthModule,
    NewLanguagesModule,
    NewTranslationsModule,
    NewContentModule,
    NewLegalModule,
    NewPaymentsModule,
    NewBootstrapModule,
    NewProvidersModule,
    LegacyModule,
  ],
})
export class AppModule {}
