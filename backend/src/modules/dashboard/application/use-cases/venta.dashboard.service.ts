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
    
    const result: any = await this.prisma.$queryRaw`
      WITH ventas_filtradas AS (
        SELECT *
        FROM "Venta"
        WHERE fecha >= ${prev30Days}
      ),

      ventas_dia AS (
        SELECT 
          DATE(v.fecha) as fecha,
          COALESCE(SUM(v.total), 0) as total,
          COALESCE(COUNT(v.id), 0) as ventas,
          COALESCE(SUM(v.total) - LAG(SUM(v.total)) OVER (ORDER BY DATE(v.fecha)), 0) as fluctuacion        
        FROM ventas_filtradas as v
        WHERE fecha >= ${last30Days}
        GROUP BY DATE(v.fecha)
        ORDER BY fecha ASC
      ),

      ventas_empleado AS (
        SELECT 
          e.nombre, 
          COALESCE(SUM(CASE WHEN v.fecha >= ${last30Days} THEN v.total ELSE 0 END), 0) as total_actual,
          COALESCE(SUM(CASE WHEN v.fecha >= ${prev30Days} AND v.fecha < ${last30Days} THEN v.total ELSE 0 END), 0) as total_anterior,
          COALESCE(COUNT(CASE WHEN v.fecha >= ${last30Days} THEN v.id END), 0) as ventas,
          COALESCE(AVG(CASE WHEN v.fecha >= ${last30Days} THEN v.total END), 0) as ticketMedio
        FROM ventas_filtradas v
        JOIN "Empleado" e ON v."empleadoId" = e.id
        GROUP BY e.nombre
      ),

      ventas_local AS (
        SELECT 
          l.nombre, 
          COALESCE(SUM(CASE WHEN v.fecha >= ${last30Days} THEN v.total ELSE 0 END), 0) as total_actual,
          COALESCE(SUM(CASE WHEN v.fecha >= ${prev30Days} AND v.fecha < ${last30Days} THEN v.total ELSE 0 END), 0) as total_anterior,
          COALESCE(COUNT(CASE WHEN v.fecha >= ${last30Days} THEN v.id END), 0) as ventas,
          COALESCE(AVG(CASE WHEN v.fecha >= ${last30Days} THEN v.total END), 0) as ticketMedio
        FROM ventas_filtradas v
        JOIN "Local" l ON v."localId" = l.id
        GROUP BY l.nombre
      ),

      ventas_productos AS (
        SELECT 
          p.id,
          p.nombre,
          COALESCE(SUM(CASE WHEN v.fecha >= ${last30Days} THEN vd.cantidad ELSE 0 END), 0) as cantidad_actual,
          COALESCE(SUM(CASE WHEN v.fecha >= ${prev30Days} AND v.fecha < ${last30Days} THEN vd.cantidad ELSE 0 END), 0) as cantidad_anterior,
          COALESCE(SUM(CASE WHEN v.fecha >= ${last30Days} THEN vd.cantidad * vd."precioFinal" ELSE 0 END), 0) as total,
          COALESCE(AVG(CASE WHEN v.fecha >= ${last30Days} THEN vd."precioFinal" END), 0) as precioMedio
        FROM "VentaDetalle" vd
        JOIN ventas_filtradas v ON vd."ventaId" = v.id
        JOIN "Producto" p ON vd."productoId" = p.id
        GROUP BY p.id, p.nombre
      )

      SELECT json_build_object(
        'ventasPorDia', COALESCE((SELECT json_agg(ventas_dia) FROM ventas_dia), '[]'::json),
        'ventasPorEmpleado', COALESCE((SELECT json_agg(ventas_empleado) FROM ventas_empleado), '[]'::json),
        'ventasPorLocal', COALESCE((SELECT json_agg(ventas_local) FROM ventas_local), '[]'::json),
        'ventasProductos', COALESCE((SELECT json_agg(ventas_productos) FROM ventas_productos), '[]'::json)
      ) as data
    `;
    
    return result[0].data;
  }
}