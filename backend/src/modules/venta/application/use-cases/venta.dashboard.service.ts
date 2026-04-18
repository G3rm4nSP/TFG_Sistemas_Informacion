import { BadRequestException, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ventaSelect } from '../../infrastructure/prisma/venta.select';


@Injectable()
export class VentaDashboardService {
  
  constructor(private prisma: PrismaService) {}

  async getDashboardData() {

    const startDay = new Date();
    startDay.setHours(0, 0, 0, 0);

    const endDay = new Date();
    endDay.setHours(23, 59, 59, 999);

    const startMonth = new Date();
    startMonth.setDate(1);
    startMonth.setHours(0, 0, 0, 0);

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const [
      evolucion,
      ingresosHoy,
      ingresosMes,
      ticketMedio,
      topEmpleadosBeneficios,
      topEmpleadosVentas,
      topProductos
    ] = await Promise.all([

      // Evolución diaria
      this.prisma.$queryRaw`
        SELECT DATE("fecha") as fecha, CAST(SUM(total) AS FLOAT) as total
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

      // Ingresos del mes
      this.prisma.venta.aggregate({
        _sum: { total: true },
        where: {
          fecha: {
            gte: startMonth,
          },
        },
      }),

      // Ticket medio
      this.prisma.venta.aggregate({
        _avg: { total: true },
      }),

      // Top empleados por beneficios
      this.prisma.$queryRaw`
        SELECT e.id, e.nombre, e.apellidos, ROUND(SUM(v.total)::numeric, 2) as total
        FROM "Venta" v
        JOIN "Empleado" e ON v."empleadoId" = e.id
        WHERE v."fecha" >= ${last30Days}
        GROUP BY e.id
        ORDER BY total DESC
        LIMIT 3
      `,

      // Top empleados por ventas
      this.prisma.$queryRaw`
        SELECT e.id, e.nombre, e.apellidos, CAST(COUNT(v.id) AS INTEGER) as ventas
        FROM "Venta" v
        JOIN "Empleado" e ON v."empleadoId" = e.id
        WHERE v."fecha" >= ${last30Days}
        GROUP BY e.id
        ORDER BY ventas DESC
        LIMIT 3
      `,

      // Top productos vendidos
      this.prisma.$queryRaw`
        SELECT p.id, p.nombre, CAST(SUM(vd.cantidad) AS INTEGER) as cantidad
        FROM "VentaDetalle" vd 
        JOIN "Venta" v ON vd."ventaId" = v.id
        JOIN "Producto" p ON vd."productoId" = p.id
        WHERE v."fecha" >= ${last30Days}
        GROUP BY p.id, p.nombre
        ORDER BY cantidad DESC
        LIMIT 5
      `

    ]);

    return {
      evolucion,
      ingresosHoy: Math.round((ingresosHoy._sum.total || 0) * 100) / 100,
      ingresosMes: Math.round((ingresosMes._sum.total || 0) * 100) / 100,
      ticketMedio: Math.round((ticketMedio._avg.total || 0) * 100) / 100,
      topEmpleadosBeneficios,
      topEmpleadosVentas,
      topProductos
    };
  }
}