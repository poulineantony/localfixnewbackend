import { Module } from '@nestjs/common';
import { NewProvidersController } from './new-providers.controller';
import { NewProvidersService } from './new-providers.service';

@Module({
  controllers: [NewProvidersController],
  providers: [NewProvidersService],
  exports: [NewProvidersService],
})
export class NewProvidersModule {}
