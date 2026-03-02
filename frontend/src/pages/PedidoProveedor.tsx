import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { api } from "../api/axios";

interface Producto {
  id?: string;
  nombre: string;
  descripcion : string;
  tipo: string;
  porcentajeIVA: number;
  precioBase: number;
  expiracion: Date;
  cantidad: number;
  descuento: number;
  updatedAt: Date;
  localId: string;
  tipoUbicacion: string;
  descripcionUbicacion: string;
}


export default function PedidoProveedor() {
  const { id } = useParams();
  const [proveedor, setProveedor] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchProveedor(id);
    }
  }, [id]);

  const fetchProveedor = async (id: string) => {
    const prov = await api.get(`/proveedor/${id}`);
    setProveedor(prov.data);
  };

  if (!proveedor) return <Typography>Cargando...</Typography>;

  return (
    <Box p={5}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" mb={2}>Pedido a {proveedor.nombre}</Typography>
        <Typography>Correo: {proveedor.correo}</Typography>
        <Typography>Teléfono: {proveedor.telefono}</Typography>
        <Typography>Horario entrega: {proveedor.horarioEntrega}</Typography>
        <Typography>Descripción: {proveedor.descripcion}</Typography>

        {/* Aquí luego irá la lógica del pedido */}
      </Paper>
    </Box>
  );
}