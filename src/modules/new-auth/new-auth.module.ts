import { Module } from '@nestjs/common';
import { NewAuthController } from './new-auth.controller';
import { NewAuthService } from './new-auth.service';

@Module({
  controllers: [NewAuthController],
  providers: [NewAuthService],
  exports: [NewAuthService],
})
export class NewAuthModule {}
