import { Module } from '@nestjs/common';
import { VentaDetalleService } from './venta-detalle.service';
import { VentaDetalleController } from './venta-detalle.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [VentaDetalleController],
  providers: [VentaDetalleService],
  imports: [PrismaModule],
})
export class VentaDetalleModule {}
