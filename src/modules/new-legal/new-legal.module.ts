import { Module } from '@nestjs/common';
import { NewLegalController } from './new-legal.controller';
import { NewLegalService } from './new-legal.service';

@Module({
  controllers: [NewLegalController],
  providers: [NewLegalService],
  exports: [NewLegalService],
})
export class NewLegalModule {}
