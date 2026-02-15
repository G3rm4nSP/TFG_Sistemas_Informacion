import { Module } from '@nestjs/common';
import { LocalService } from './local.service';
import { LocalController } from './local.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [LocalController],
  providers: [LocalService],
  imports: [PrismaModule],
})
export class LocalModule {}
