import { Module } from '@nestjs/common';
import { NewContentController } from './new-content.controller';
import { NewContentService } from './new-content.service';

@Module({
  controllers: [NewContentController],
  providers: [NewContentService],
  exports: [NewContentService],
})
export class NewContentModule {}
