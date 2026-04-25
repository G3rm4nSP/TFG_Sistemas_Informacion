import { Module } from '@nestjs/common';
import { GeneralDashboardService } from './application/use-cases/general.dashboard.service';
import { VentaDashboardService } from './application/use-cases/venta.dashboard.service';
import { StockDashboardService } from './application/use-cases/stock.dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  controllers: [DashboardController],
  providers: [GeneralDashboardService, VentaDashboardService,StockDashboardService],
  imports: [PrismaModule],
})
export class DashboardModule {}
