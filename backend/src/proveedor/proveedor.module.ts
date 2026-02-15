import { Module } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { ProveedorController } from './proveedor.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [ProveedorController],
  providers: [ProveedorService],
  imports: [PrismaModule],
})
export class ProveedorModule {}
