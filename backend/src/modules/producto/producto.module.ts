import { Module } from '@nestjs/common';
import { ProductoService } from './application/use-cases/producto.service';
import { ProductoController } from './producto.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  controllers: [ProductoController],
  providers: [ProductoService],
  imports: [PrismaModule],
})
export class ProductoModule {}
