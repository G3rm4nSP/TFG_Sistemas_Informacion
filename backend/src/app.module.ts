import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmpleadoModule } from './modules/empleado/empleado.module';
import { ClienteModule } from './modules/cliente/cliente.module';
import { ProveedorModule } from './modules/proveedor/proveedor.module';
import { LocalModule } from './modules/local/local.module';
import { ProductoModule } from './modules/producto/producto.module';
import { VentaModule } from './modules/venta/venta.module';
import { CompraModule } from './modules/compra/compra.module';
import { StockModule } from './modules/stock/stock.module';
import { UbicacionModule } from './modules/ubicacion/ubicacion.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    PrismaModule,
    EmpleadoModule,
    ClienteModule,
    ProveedorModule, 
    LocalModule, 
    ProductoModule, 
    VentaModule, 
    CompraModule, 
    StockModule, 
    UbicacionModule, 
    UsuarioModule, 
    DashboardModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}