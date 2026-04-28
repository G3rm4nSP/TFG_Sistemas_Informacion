import { BadRequestException, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class GeneralDashboardService {
  
  constructor(private prisma: PrismaService) {}

  async getGeneralDashboardData() {

    const startYesterday = new Date();
    startYesterday.setHours(0, 0, 0, 0);
    startYesterday.setDate(startYesterday.getDate() - 1);

    const endYesterday = new Date();
    endYesterday.setDate(endYesterday.getDate() - 1);
    endYesterday.setHours(23, 59, 59, 999);

    const startDay = new Date();
    startDay.setHours(0, 0, 0, 0);

    const endDay = new Date();
    endDay.setHours(23, 59, 59, 999);

    const startMonth = new Date();
    startMonth.setDate(1);
    startMonth.setHours(0, 0, 0, 0);

    const startMonthAnterior = new Date();
    startMonthAnterior.setDate(1);
    startMonthAnterior.setMonth(startMonthAnterior.getMonth() - 1);
    startMonthAnterior.setHours(0, 0, 0, 0);

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const [
      evolucion,
      ingresosHoy,
      ingresosAyer,
      ingresosMes,
      ingresosMesAnterior,
      ticketMedio,
      ticketMedioMesAnterior,
      topEmpleadosBeneficios,
      topEmpleadosVentas,
      topProductos,
      clientesNuevos,
      stockBajo,
      caducidadProductos
    ] = await Promise.all([

      // Evolución diaria
      this.prisma.$queryRaw`
        SELECT 
          DATE("fecha") as fecha, 
          CAST(SUM(total) AS FLOAT) as total, 
          CAST(COUNT(id) AS INTEGER) as ventas
        FROM "Venta"
        WHERE "fecha" >= ${last30Days}
        GROUP BY DATE("fecha")
        ORDER BY fecha ASC
      `,

      // Ingresos del día 
      this.prisma.venta.aggregate({
        _sum: { total: true },
        where: {
          fecha: {
            gte: startDay,
            lte: endDay,
          },
        },
      }),

      // Ingresos de ayer
      this.prisma.venta.aggregate({
        _sum: { total: true },
        where: {
          fecha: {
            gte: startYesterday,
            lte: endYesterday,
          },
        },
      }),

      
      // Ingresos del mes
      this.prisma.venta.aggregate({
        _sum: { total: true },
        where: {
          fecha: {
            gte: startMonth,
          },
        },
      }),

      // Ingresos mes anterior
      this.prisma.venta.aggregate({
        _sum: { total: true },
        where: {
          fecha: {
            gte: startMonthAnterior,
            lt: startMonth,
          },
        },
      }),

      // Ticket medio del mes
      this.prisma.venta.aggregate({
        _avg: { total: true },
        where: {
          fecha: {
            gte: startMonth,
          },
        },
      }),

      //Ticket medio del mes anterior
      this.prisma.venta.aggregate({
        _avg: { total: true },
        where: {
          fecha: {
            gte:  startMonthAnterior,
            lt: startMonth,
          },
        },
      }),


      // Top empleados por beneficios
      this.prisma.$queryRaw`
        SELECT 
          e.id, e.nombre, 
          e.apellidos, 
          ROUND(SUM(v.total)::numeric, 2) as cantidad
        FROM "Venta" v
        JOIN "Empleado" e ON v."empleadoId" = e.id
        WHERE v."fecha" >= ${last30Days}
        GROUP BY e.id
        ORDER BY cantidad DESC
        LIMIT 3
      `,

      // Top empleados por ventas
      this.prisma.$queryRaw`
        SELECT 
          e.id, e.nombre, 
          e.apellidos, 
          CAST(COUNT(v.id) AS INTEGER) as cantidad
        FROM "Venta" v
        JOIN "Empleado" e ON v."empleadoId" = e.id
        WHERE v."fecha" >= ${last30Days}
        GROUP BY e.id
        ORDER BY cantidad DESC
        LIMIT 3
      `,

      // Top productos vendidos
      this.prisma.$queryRaw`
        SELECT 
          p.id, p.nombre, 
          CAST(SUM(vd.cantidad) AS INTEGER) as cantidad
        FROM "VentaDetalle" vd 
        JOIN "Venta" v ON vd."ventaId" = v.id
        JOIN "Producto" p ON vd."productoId" = p.id
        WHERE v."fecha" >= ${last30Days}
        GROUP BY p.id, p.nombre
        ORDER BY cantidad DESC
        LIMIT 5
      `,

      // Clientes nuevos
      this.prisma.cliente.count({
        where: {
          createdAt: {
            gte: last30Days
          }
        }
      }),

      // Productos con stock bajo (menos de 10 unidades)
      this.prisma.$queryRaw`
        SELECT 
          p.id,
          p.nombre,
          CAST(SUM(s.cantidad) AS INTEGER) as cantidad
        FROM "Stock" s
        JOIN "Producto" p ON s."productoId" = p.id
        GROUP BY p.id, p.nombre
        HAVING SUM(s.cantidad) < 20
        ORDER BY cantidad ASC
      `,

      // Productos próximos a caducar (en los próximos 30 días)
      this.prisma.$queryRaw`
        SELECT 
          p.id,
          p.nombre,
          p.expiracion,
          s.cantidad
        FROM "Stock" s
        JOIN "Producto" p ON s."productoId" = p.id
        WHERE 
          p.expiracion IS NOT NULL
          AND p.expiracion <= NOW() + INTERVAL '30 days'
        ORDER BY p.expiracion ASC
      `,
    ]);
    return {
      evolucion,
      ingresosHoy: Math.round((ingresosHoy._sum.total || 0) * 100) / 100,
      ingresosAyer: Math.round((ingresosAyer._sum.total || 0) * 100) / 100,
      ingresosMes: Math.round((ingresosMes._sum.total || 0) * 100) / 100,
      ingresosMesAnterior: Math.round((ingresosMesAnterior._sum.total || 0) * 100) / 100,
      ticketMedio: Math.round((ticketMedio._avg.total || 0) * 100) / 100,
      ticketMedioMesAnterior: Math.round((ticketMedioMesAnterior._avg.total || 0) * 100) / 100,
      topEmpleadosBeneficios,
      topEmpleadosVentas,
      topProductos,
      clientesNuevos,
      stockBajo,
      caducidadProductos
    };
  }
}