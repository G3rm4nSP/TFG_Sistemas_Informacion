import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { EmpleadoModule } from './empleado/empleado.module';
import { ClienteModule } from './cliente/cliente.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { LocalModule } from './local/local.module';

@Module({
  imports: [PrismaService, EmpleadoModule, ClienteModule, ProveedorModule, LocalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
