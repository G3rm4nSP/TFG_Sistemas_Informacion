import { Module } from '@nestjs/common';
import { EmpleadoHorarioService } from './application/use-cases/empleado-horario.service';
import { EmpleadoHorarioController } from './empleado-horario.controller';
import { PrismaModule } from '../../prisma/prisma.module';
@Module({
  controllers: [EmpleadoHorarioController],
  providers: [EmpleadoHorarioService],
  imports: [PrismaModule],
})
export class EmpleadoHorarioModule {}
