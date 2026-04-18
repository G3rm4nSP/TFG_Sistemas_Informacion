import { Module } from '@nestjs/common';
import { VentaService } from './application/use-cases/venta.service';
import { VentaDashboardService } from './application/use-cases/venta.dashboard.service';
import { VentaController } from './venta.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  controllers: [VentaController],
  providers: [VentaService , VentaDashboardService],
  imports: [PrismaModule],
})
export class VentaModule {}
