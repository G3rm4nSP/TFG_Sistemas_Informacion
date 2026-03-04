import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
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
  stocks : {
    cantidad: number;
  }[];
}

interface Stock {
    id : string;
    productoId : string;
    ubicacionId : string;
    cantidad : number;
    descuento : number;
    updatedAt : Date;

    producto : Producto;
    ubicacion : Ubicacion;
}

type Ubi = "ALMACEN" | "TIENDA";

interface Ubicacion {
    id : string;
    localId : string;
    tipo : Ubi;
    descripcion : string;
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
    
    const [stocks, setStocks] = useState<Producto[]>([]);

    useEffect(() => {
        fetchStocks();
    })

    const fetchStocks = async () => {
        const stck = await api.get("/stock");
        setStocks(stck.data); 
    };

    return (
        <Box p={2}>
            <Typography variant="h4" gutterBottom>
                Ventas
            </Typography>
            
        </Box>
    );
}