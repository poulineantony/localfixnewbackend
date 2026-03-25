import { Module } from '@nestjs/common';
import { NewPaymentsController } from './new-payments.controller';
import { NewPaymentsService } from './new-payments.service';

@Module({
  controllers: [NewPaymentsController],
  providers: [NewPaymentsService],
  exports: [NewPaymentsService],
})
export class NewPaymentsModule {}
