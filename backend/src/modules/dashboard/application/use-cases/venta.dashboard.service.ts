import { BadRequestException, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class VentaDashboardService {
  
  constructor(private prisma: PrismaService) {}

  async getVentaDashboardData() {

    const now = new Date();

    const last30Days = new Date();
    last30Days.setDate(now.getDate() - 30);

    const prev30Days = new Date();
    prev30Days.setDate(now.getDate() - 60);
    
    const [
      ventasPorDia,
      ventasPorEmpleado,
      ventasPorLocal,
      ventasProductos,
    ] = await Promise.all([

      // Ventas por dia (ESTA SE QUEDA IGUAL)
      this.prisma.$queryRaw`
        SELECT 
          DATE("fecha") as fecha,
          CAST(SUM(total) AS NUMERIC) as total, 
          CAST(COUNT(id) AS INTEGER) as ventas, 
          CAST(AVG(total) AS NUMERIC) as ticketMedio,
          CAST(SUM(total) - LAG(SUM(total)) OVER (ORDER BY DATE("fecha")) AS NUMERIC) as fluctuacion         
        FROM "Venta"
        WHERE fecha >= ${last30Days}
        GROUP BY DATE("fecha")
        ORDER BY fecha ASC
      `,

      // Ventas por empleado 
      this.prisma.$queryRaw`
        SELECT 
          e.nombre, 
          CAST(SUM(CASE WHEN v.fecha >= ${last30Days} 
            THEN v.total ELSE 0 END) AS NUMERIC) as total_actual,
          CAST(SUM(CASE WHEN v.fecha >= ${prev30Days} 
            AND v.fecha < ${last30Days} THEN v.total ELSE 0 END) AS NUMERIC) as total_anterior,
          CAST(COUNT(CASE WHEN v.fecha >= ${last30Days} 
            THEN v.id END) AS INTEGER) as ventas,
          CAST(AVG(CASE WHEN v.fecha >= ${last30Days} 
            THEN v.total END) AS NUMERIC) as ticketMedio
        FROM "Venta" v
        JOIN "Empleado" e ON v."empleadoId" = e.id
        WHERE v.fecha >= ${prev30Days}
        GROUP BY e.nombre
      `,

      // Ventas por local
      this.prisma.$queryRaw`
        SELECT 
          l.nombre, 
          CAST(SUM(CASE WHEN v.fecha >= ${last30Days} 
            THEN v.total ELSE 0 END) AS NUMERIC) as total_actual,
          CAST(SUM(CASE WHEN v.fecha >= ${prev30Days} 
            AND v.fecha < ${last30Days} THEN v.total ELSE 0 END) AS NUMERIC) as total_anterior,
          CAST(COUNT(CASE WHEN v.fecha >= ${last30Days} 
            THEN v.id END) AS INTEGER) as ventas,
          CAST(AVG(CASE WHEN v.fecha >= ${last30Days} 
            THEN v.total END) AS NUMERIC) as ticketMedio
        FROM "Venta" v
        JOIN "Local" l ON v."localId" = l.id
        WHERE v.fecha >= ${prev30Days}
        GROUP BY l.nombre
      `,

      // Productos vendidos 
      this.prisma.$queryRaw`
        SELECT 
          p.id,
          p.nombre, 
          CAST(SUM(CASE WHEN v.fecha >= ${last30Days} 
            THEN vd.cantidad ELSE 0 END) AS INTEGER) as cantidad_actual,
          CAST(SUM(CASE WHEN v.fecha >= ${prev30Days} 
            AND v.fecha < ${last30Days} THEN vd.cantidad ELSE 0 END) AS INTEGER) as cantidad_anterior,
          CAST(SUM(CASE WHEN v.fecha >= ${last30Days} 
            THEN vd.cantidad * vd."precioFinal" ELSE 0 END) AS NUMERIC) as total,
          CAST(AVG(CASE WHEN v.fecha >= ${last30Days} 
            THEN vd."precioFinal" END) AS NUMERIC) as precioMedio
        FROM "VentaDetalle" vd 
        JOIN "Venta" v ON vd."ventaId" = v.id
        JOIN "Producto" p ON vd."productoId" = p.id
        WHERE v.fecha >= ${prev30Days}
        GROUP BY p.id, p.nombre
        ORDER BY cantidad_actual DESC
      `,
    ]);

    return {
      ventasPorDia,
      ventasPorEmpleado,
      ventasPorLocal,
      ventasProductos
    };
  }
}