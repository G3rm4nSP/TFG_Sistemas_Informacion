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
import { StockModule } from './stock/stock.module';
import { UbicacionModule } from './ubicacion/ubicacion.module';
import { UsuarioModule } from './usuario/usuario.module';
import { VentaDetalleModule } from './venta-detalle/venta-detalle.module';
import { CompraDetalleModule } from './compra-detalle/compra-detalle.module';
import { EmpleadoHorarioModule } from './empleado-horario/empleado-horario.module';

@Module({
  imports: [PrismaService, EmpleadoModule, ClienteModule, ProveedorModule, LocalModule, ProductoModule, VentaModule, CompraModule, StockModule, UbicacionModule, UsuarioModule, VentaDetalleModule, CompraDetalleModule, EmpleadoHorarioModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
