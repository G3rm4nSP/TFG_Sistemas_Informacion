import { Module } from '@nestjs/common';
import { LocalService } from './application/use-cases/local.service';
import { LocalController } from './local.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  controllers: [LocalController],
  providers: [LocalService],
  imports: [PrismaModule],
})
export class LocalModule {}
