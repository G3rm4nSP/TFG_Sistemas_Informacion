import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { EmpleadoModule } from './empleado/empleado.module';

@Module({
  imports: [PrismaService, EmpleadoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
