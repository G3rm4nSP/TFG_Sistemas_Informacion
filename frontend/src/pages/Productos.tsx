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
  stocks : {
    cantidad: number;
  }[];
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
  const [searchProducto, setSearchProducto] = useState("");
  const [openFormProducto, setOpenFormProducto] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [catalogoProductos, setCatalogoProductos] = useState<Producto[]>([]);
  const [formData, setFormData] = useState<any>({});

  const token = localStorage.getItem("accessToken");
  const user = token ? decodeToken(token) : null;

 
  useEffect(() => {
    fetchCatalogoProductos();
  }, []);

  const fetchCatalogoProductos = async () => {
    const productos = await api.get("/producto");
    setCatalogoProductos(productos.data);
  };

  const productosFiltrados = catalogoProductos.filter((producto) =>{
    const texto = searchProducto.toLowerCase();

    return (
      producto.nombre.toLowerCase().includes(texto) ||
      producto.descripcion.toLowerCase().includes(texto)
    );
  });

  const handleSubmitProducto = async () => {
    const payload = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      tipo: formData.tipo,
      porcentajeIVA: parseFloat(formData.porcentajeIVA),
      precioBase: parseFloat(formData.precioBase),
      expiracion: formData.expiracion || null,
    };

    await api.post("/producto", payload);
    setSuccessMsg("Producto creado correctamente");
    setOpenFormProducto(false);
    fetchCatalogoProductos();
    setFormData({});
  }

  return (
    <Box p={5}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" mb={4} fontWeight={600}>
          Catalogo de productos
        </Typography>

        <Stack spacing={2} mt={1}>
            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
              <TextField
                label="Buscar por nombre o descripción"
                fullWidth
                value={searchProducto}
                onChange={(e) => setSearchProducto(e.target.value)}
              />
              <Button variant="contained" color="warning" onClick={() => setOpenFormProducto(true)}> Nuevo Producto </Button>
            </Stack>

            {productosFiltrados.map((producto)=> (
              <Paper key = {producto.id} sx={{ p: 3, borderRadius: 3 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                  <Stack spacing={2} mt={1}>
                    <Typography fontWeight={600}>{producto.nombre}</Typography>
                    <Typography variant="body2">Descripcion: {producto.descripcion}</Typography>
                    <Typography variant="body2">Precio Base: {producto.precioBase.toFixed(2)} €</Typography>
                  </Stack>
                  <Stack spacing={2} mt={1}>
                    <Typography fontWeight={600}>Cantidad en Stock</Typography>
                    <Typography variant="body2">{producto.stocks[0]?.cantidad || 0}</Typography>
                  </Stack>                  
                </Stack>
              </Paper>
            ))}
          </Stack>        
      </Paper>


      {/* Formulario Nuevo Producto */}
      <Dialog
        open={openFormProducto}
        onClose={() => setOpenFormProducto(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Nuevo Producto
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Nombre"
              value={formData.nombre || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nombre: e.target.value,
                })
              }
            />
            <TextField
              label="Descripcion"
              value={formData.descripcion || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  descripcion: e.target.value,
                })
              }
            />
            <TextField
              label="tipo"
              value={formData.tipo || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tipo: e.target.value,
                })
              }
            />
            <TextField
              label="Porcentaje IVA"
              value={formData.porcentajeIVA || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  porcentajeIVA: e.target.value,
                })
              }
            />

            <TextField
              label="Precio Base"
              value={formData.precioBase || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  precioBase: e.target.value,
                })
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenFormProducto(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSubmitProducto}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMsg}
        autoHideDuration={6000}
        onClose={() => setSuccessMsg("")}
      >
        <Alert severity="success">{successMsg}</Alert>
      </Snackbar>
    </Box>
  );
}