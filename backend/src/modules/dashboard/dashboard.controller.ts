import { Controller, Get, Post, Body, Patch, Param, Delete ,UseGuards } from '@nestjs/common';
import { GeneralDashboardService } from './application/use-cases/general.dashboard.service';
import { VentaDashboardService } from './application/use-cases/venta.dashboard.service';
import { StockDashboardService } from './application/use-cases/stock.dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly generalDashboardService: GeneralDashboardService,
    private readonly ventaDashboardService: VentaDashboardService,
    private readonly stockDashboardService: StockDashboardService
  ) {}

  @Get('general')
  getGeneralDashboardData() {
    return this.generalDashboardService.getGeneralDashboardData();
  }

  @Get('venta')
  getVentaDashboardData() {
    return this.ventaDashboardService.getVentaDashboardData();
  }

  @Get('stock')
  getStockDashboardData() {
    return this.stockDashboardService.getStockDashboardData();
  }
}
