import { Module } from '@nestjs/common';
import { NewBootstrapController } from './new-bootstrap.controller';
import { NewBootstrapService } from './new-bootstrap.service';

@Module({
  controllers: [NewBootstrapController],
  providers: [NewBootstrapService],
})
export class NewBootstrapModule {}
