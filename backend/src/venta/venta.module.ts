import { Module } from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [VentaController],
  providers: [VentaService],
  imports: [PrismaModule],
})
export class VentaModule {}
