import { Module } from '@nestjs/common';
import { UbicacionService } from './ubicacion.service';
import { UbicacionController } from './ubicacion.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [UbicacionController],
  providers: [UbicacionService],
  imports: [PrismaModule],
})
export class UbicacionModule {}
