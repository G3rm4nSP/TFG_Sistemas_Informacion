import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { EmpleadoModule } from './empleado/empleado.module';
import { ClienteModule } from './cliente/cliente.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { LocalModule } from './local/local.module';
import { ProductoModule } from './producto/producto.module';
import { VentaModule } from './venta/venta.module';
import { CompraModule } from './compra/compra.module';

@Module({
  imports: [PrismaService, EmpleadoModule, ClienteModule, ProveedorModule, LocalModule, ProductoModule, VentaModule, CompraModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
