import { Module } from '@nestjs/common';
import { CompraService } from './compra.service';
import { CompraController } from './compra.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [CompraController],
  providers: [CompraService],
  imports: [PrismaModule],
})
export class CompraModule {}
