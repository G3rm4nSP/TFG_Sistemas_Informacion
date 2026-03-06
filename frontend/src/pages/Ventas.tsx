import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
} from "@mui/material";

import { api } from "../api/axios";

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  porcentajeIVA: number;
  precioBase: number;
  expiracion?: Date;
}

interface Stock {
  id: string;
  stockId: string;
  ubicacionId: string;
  cantidad: number;
  descuento: number;
  updatedAt: Date;
  producto: Producto;
  ubicacion: Ubicacion;
}

type Ubi = "ALMACEN" | "TIENDA";

interface Ubicacion {
  id: string;
  localId: string;
  tipo: Ubi;
  descripcion: string;
}

function decodeToken(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function Ventas() {
  
  const [stocks, setStock] = useState<Stock[]>([]);
  const [searchProducto, setSearchProducto] = useState("");

  useEffect(() => {
    fetchStock();
  }, [])

  const fetchStock = async () => {
    const stck = await api.get("/stock");
    setStock(stck.data); 
  };

  const stocksAlmacen = stocks.filter(
    (stock) => stock.ubicacion.tipo === "ALMACEN"
  );

  const stocksTienda = stocks.filter(
    (stock) => stock.ubicacion.tipo === "TIENDA"
  );

  const tiendaFiltrada = stocksTienda.filter((stock) => {
    const texto = searchProducto.toLowerCase();

    return (
      stock.producto.nombre.toLowerCase().includes(texto) ||
      stock.producto.tipo.toLowerCase().includes(texto) ||
      stock.producto.descripcion.toLowerCase().includes(texto) ||
      stock.producto.id.toLowerCase().includes(texto)
    );
  });

  const almacenFiltrado = stocksAlmacen.filter((stock) => {
    const texto = searchProducto.toLowerCase();

    return (
      stock.producto.nombre.toLowerCase().includes(texto) ||
      stock.producto.tipo.toLowerCase().includes(texto) ||
      stock.producto.descripcion.toLowerCase().includes(texto) ||
      stock.producto.id.toLowerCase().includes(texto)
    );
  });

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Ventas
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <TextField
          label="Buscar por nombre descripción tipo o id"
          fullWidth
          value={searchProducto}
          onChange={(e) => setSearchProducto(e.target.value)}
        />
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" mb={4} fontWeight={600}>
            Productos en la tienda
          </Typography>

          <Stack spacing={2} mt={1}>
            {tiendaFiltrada.map((stock) => (
              <Paper key={stock.id} sx={{ p: 3, borderRadius: 3 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                  <Stack spacing={2} mt={1}>
                    <Typography fontWeight={600}>{stock.producto.nombre}</Typography>
                    <Typography variant="body2">Descripcion: {stock.producto.descripcion}</Typography>
                    <Typography variant="body2">Precio Base: {stock.producto.precioBase.toFixed(2)} €</Typography>
                  </Stack>
                  <Stack spacing={2} mt={1}>
                    <Typography fontWeight={600}>Cantidad en Stock</Typography>
                    <Typography variant="body2">{stock.cantidad || 0}</Typography>
                    <Typography variant="body2">Ubicacion: {stock.ubicacion.tipo}</Typography>
                  </Stack>                  
                </Stack>
              </Paper>
            ))}
          </Stack>        
        </Paper>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" mb={4} fontWeight={600}>
            Productos en el Almacen
          </Typography>

          <Stack spacing={2} mt={1}>
            {almacenFiltrado.map((stock) => (
              <Paper key={stock.id} sx={{ p: 3, borderRadius: 3 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                  <Stack spacing={2} mt={1}>
                    <Typography fontWeight={600}>{stock.producto.nombre}</Typography>
                    <Typography variant="body2">Descripcion: {stock.producto.descripcion}</Typography>
                    <Typography variant="body2">Precio Base: {stock.producto.precioBase.toFixed(2)} €</Typography>
                  </Stack>
                  <Stack spacing={2} mt={1}>
                    <Typography fontWeight={600}>Cantidad en Stock</Typography>
                    <Typography variant="body2">{stock.cantidad || 0}</Typography>
                    <Typography variant="body2">Ubicacion: {stock.ubicacion.tipo}</Typography>
                  </Stack>                  
                </Stack>
              </Paper>
            ))}
          </Stack>        
        </Paper>
      </Stack>
    </Box>
  );
}