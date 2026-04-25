import { BadRequestException, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class StockDashboardService {
  
  constructor(private prisma: PrismaService) {}

  async getStockDashboardData() {

    const now = new Date();

    const last30Days = new Date();
    last30Days.setDate(now.getDate() - 30);

    const prev30Days = new Date();
    prev30Days.setDate(now.getDate() - 60);
    
    const result: any = await this.prisma.$queryRaw`
    WITH producto_total AS (
        SELECT *
        FROM "Producto"
    ),

    mayor_stock AS (
        SELECT 
            p.id, 
            p.nombre,
            SUM (s.cantidad) as total_stock
        FROM producto_total p
        LEFT JOIN "Stock" s ON p.id = s."productoId"
        GROUP BY p.id
        ORDER BY total_stock DESC
        LIMIT 10
    ),

    stock_bajo AS (
        SELECT 
            p.id,
            p.nombre,
            CAST(SUM(s.cantidad) AS INTEGER) as cantidad
        FROM "stock" s
        JOIN producto_total p ON p.id = s."productoId"
        GROUP BY p.id, p.nombre
        HAVING SUM(s.cantidad) < 20
        ORDER BY cantidad ASC
    ),

    proximos_a_expirar AS (
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
   ),

    stock_por_colocar AS (
        SELECT
            p.id,
            p.nombre,
            SUM(CASE WHEN u.tipo = 'ALMACEN' THEN s.cantidad ELSE 0 END) as cantidad_almacen,
            SUM(CASE WHEN u.tipo = 'TIENDA' THEN s.cantidad ELSE 0 END) as cantidad_tienda,
        FROM "Stock" s
        JOIN producto_total p ON p.id = s."productoId"
        JOIN "Ubicacion" u ON s."ubicacionId" = u.id
        WHEN cantidad_tienda < 20
        GROUP BY p.id, p.nombre
        ORDER BY cantidad_tienda ASC
    ),

    

      ventas_local AS (
        SELECT 
          l.nombre, 
          SUM(CASE WHEN v.fecha >= ${last30Days} THEN v.total ELSE 0 END) as total_actual,
          SUM(CASE WHEN v.fecha >= ${prev30Days} AND v.fecha < ${last30Days} THEN v.total ELSE 0 END) as total_anterior,
          COUNT(CASE WHEN v.fecha >= ${last30Days} THEN v.id END) as ventas,
          AVG(CASE WHEN v.fecha >= ${last30Days} THEN v.total END) as ticketMedio
        FROM ventas_filtradas v
        JOIN "Local" l ON v."localId" = l.id
        GROUP BY l.nombre
      ),

      ventas_productos AS (
        SELECT 
          p.id,
          p.nombre,
          SUM(CASE WHEN v.fecha >= ${last30Days} THEN vd.cantidad ELSE 0 END) as cantidad_actual,
          SUM(CASE WHEN v.fecha >= ${prev30Days} AND v.fecha < ${last30Days} THEN vd.cantidad ELSE 0 END) as cantidad_anterior,
          SUM(CASE WHEN v.fecha >= ${last30Days} THEN vd.cantidad * vd."precioFinal" ELSE 0 END) as total,
          AVG(CASE WHEN v.fecha >= ${last30Days} THEN vd."precioFinal" END) as precioMedio
        FROM "VentaDetalle" vd
        JOIN ventas_filtradas v ON vd."ventaId" = v.id
        JOIN "Producto" p ON vd."productoId" = p.id
        GROUP BY p.id, p.nombre
      )

      SELECT json_build_object(
        'ventasPorDia', (SELECT json_agg(ventas_dia) FROM ventas_dia),
        'ventasPorEmpleado', (SELECT json_agg(ventas_empleado) FROM ventas_empleado),
        'ventasPorLocal', (SELECT json_agg(ventas_local) FROM ventas_local),
        'ventasProductos', (SELECT json_agg(ventas_productos) FROM ventas_productos)
      ) as data
    `;
    
    return result[0].data;
  }
}