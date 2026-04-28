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
      SELECT id, nombre, "precioBase", expiracion
      FROM "Producto"
    ),
    
    stock_actual AS (
      SELECT 
        *
      FROM "Stock"
    ),

    ventas_filtradas AS (
      SELECT 
        vd."productoId",
        SUM(vd.cantidad) as ventas
      FROM "VentaDetalle" vd
      JOIN "Venta" v ON vd."ventaId" = v.id
      WHERE v.fecha >= ${prev30Days} AND v.fecha < ${last30Days}
      GROUP BY vd."productoId"
    ),

    stock_total AS (
      SELECT
        "productoId",
        SUM(s.cantidad) as stock,
        SUM(s.valor) as valor_total
      FROM stock_actual s
      GROUP BY "productoId"
    ),

    //ubicaciones especificas de donde todos los stocks en esos productos(ubicacion tipo y descripcion)
    mayor_stock AS (
      SELECT 
        p.id, 
        p.nombre,
        p."precioBase",
        COALESCE(s.stock, 0) as total_stock
      FROM producto_total p
      LEFT JOIN stock_total s ON p.id = s."productoId"
      ORDER BY total_stock DESC
      LIMIT 10
    ),

    stock_bajo AS (
      SELECT 
        p.id,
        p.nombre,
        COALESCE(s.stock, 0) as cantidad
      FROM producto_total p
      LEFT JOIN stock_total s ON p.id = s."productoId"
      WHERE COALESCE(s.stock, 0) < 20
      ORDER BY cantidad ASC
    ),

    proximos_a_expirar AS (
      SELECT 
        p.id,
        p.nombre,
        p.expiracion,
        s.stock as cantidad
      FROM producto_total p
      LEFT JOIN stock_total s ON p.id = s."productoId"
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
        SUM(CASE WHEN u.tipo = 'TIENDA' THEN s.cantidad ELSE 0 END) as cantidad_tienda
      FROM stock_actual s
      JOIN producto_total p ON p.id = s."productoId"
      JOIN "Ubicacion" u ON s."ubicacionId" = u.id
      GROUP BY p.id, p.nombre
      HAVING SUM(CASE WHEN u.tipo = 'TIENDA' THEN s.cantidad ELSE 0 END) < 20
      ORDER BY cantidad_tienda ASC
    ),

    valor_total AS (
      SELECT SUM(valor_total) as valor_total
      FROM stock_total
    ),

    maximo_beneficio AS (
      SELECT 
        SUM(
          (s.cantidad * (p."precioBase" * (1 - COALESCE(s.descuento,0)/100.0)))
          - s.valor
        ) as beneficio
      FROM stock_actual s
      JOIN producto_total p ON s."productoId" = p.id
    ),
    
    productos_pocas_ventas AS (
      SELECT
        p.id,
        p.nombre,
        COALESCE(v.ventas, 0) as cantidad_vendida
      FROM producto_total p
      LEFT JOIN ventas_filtradas v ON p.id = v."productoId"
      WHERE COALESCE(v.ventas, 0) < 10
      ORDER BY cantidad_vendida ASC
    ),

    rotacion_stock AS (
      SELECT
        p.id,
        p.nombre,
        COALESCE(v.ventas, 0) / NULLIF(s.stock, 0) as rotacion
      FROM producto_total p
      LEFT JOIN ventas_filtradas v ON p.id = v."productoId"
      LEFT JOIN stock_total s ON p.id = s."productoId"
      ORDER BY rotacion DESC
    )

    SELECT json_build_object(
      'mayorStock', (SELECT json_agg(mayor_stock) FROM mayor_stock),
      'stockBajo', (SELECT json_agg(stock_bajo) FROM stock_bajo),
      'proximosAExpirar', (SELECT json_agg(proximos_a_expirar) FROM proximos_a_expirar), 
      'stockPorColocar', (SELECT json_agg(stock_por_colocar) FROM stock_por_colocar),
      'valorTotal', (SELECT valor_total FROM valor_total),
      'maximoBeneficio', (SELECT beneficio FROM maximo_beneficio),
      'productosPocasVentas', (SELECT json_agg(productos_pocas_ventas) FROM productos_pocas_ventas),
      'rotacionStock', (SELECT json_agg(rotacion_stock) FROM rotacion_stock)
    ) as data
    `;    
    return result[0].data;
  }
}