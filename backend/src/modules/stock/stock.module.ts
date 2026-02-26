import { Module } from '@nestjs/common';
import { StockService } from './application/use-cases/stock.service';
import { StockController } from './stock.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  controllers: [StockController],
  providers: [StockService],
  imports: [PrismaModule],
})
export class StockModule {}
