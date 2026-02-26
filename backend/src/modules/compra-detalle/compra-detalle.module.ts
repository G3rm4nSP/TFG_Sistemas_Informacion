import { Module } from '@nestjs/common';
import { CompraDetalleService } from './application/use-cases/compra-detalle.service';
import { CompraDetalleController } from './compra-detalle.controller';
import { PrismaModule } from '../../prisma/prisma.module';
@Module({
  controllers: [CompraDetalleController],
  providers: [CompraDetalleService],
  imports: [PrismaModule], 
})
export class CompraDetalleModule {}
