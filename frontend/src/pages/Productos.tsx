import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Collapse,
  Stack,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { api } from "../api/axios";

interface Producto {
  id: string;
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

function decodeToken(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function ProductosPage() {

  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async() => {
    const res = await api.get("/productos");
    setProductos(res.data);
  };

  return <h1>Módulo Productos</h1>;
}