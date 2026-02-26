import { Module } from '@nestjs/common';
import { EmpleadoAusenciaService } from './application/use-cases/empleado-ausencia.service';
import { EmpleadoAusenciaController } from './empleado-ausencia.controller';
import { PrismaModule } from '../../prisma/prisma.module';
@Module({
  controllers: [EmpleadoAusenciaController],
  providers: [EmpleadoAusenciaService],
  imports: [PrismaModule],
})
export class EmpleadoAusenciaModule {}
