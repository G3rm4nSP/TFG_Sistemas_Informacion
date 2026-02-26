import { Module } from '@nestjs/common';
import { EmpleadoService } from './application/use-cases/empleado.service';
import { EmpleadoController } from './empleado.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EmpleadoController],
  providers: [EmpleadoService],
})
export class EmpleadoModule {}
