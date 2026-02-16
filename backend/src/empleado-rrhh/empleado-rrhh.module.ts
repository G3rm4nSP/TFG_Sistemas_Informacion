import { Module } from '@nestjs/common';
import { EmpleadoRrhhService } from './empleado-rrhh.service';
import { EmpleadoRrhhController } from './empleado-rrhh.controller';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  controllers: [EmpleadoRrhhController],
  providers: [EmpleadoRrhhService],
  imports: [PrismaModule],
})
export class EmpleadoRrhhModule {}
