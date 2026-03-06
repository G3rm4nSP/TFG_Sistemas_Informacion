import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { api } from "../api/axios";
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
  local : {
    nombre: string;
  }
};

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

export default function Ventas() {
  const [searchProducto, setSearchProducto] = useState("");
  const [searchUbicacion, setSearchUbicacion] = useState("");
  const [openFormProducto, setOpenFormProducto] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState<any>({});
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [movido, setMovido] = useState<any>();

  const token = localStorage.getItem("accessToken");
  const user = token ? decodeToken(token) : null;

 
  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    const stck = await api.get("/stock");
    setStocks(stck.data); 
  };

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
    setFormData({});
  }

  const handleDeleteStock = async (id : String) => {

    try {
      await api.delete(`/stock/${id}`);
      setSuccessMsg("Producto eliminado correctamente")
      fetchStock();

    } catch (error) {
      console.error("Error moviendo stock:", error);
      setErrorMsg("Error al eliminar el stock. Inténtalo de nuevo.");
    }
  };

  return (
    <Box p={5}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h4" mb={4} fontWeight={600}>
          Catalogo de productos
        </Typography>
    
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <TextField
            label="Buscar por nombre descripción tipo o id"
            fullWidth
            value={searchProducto}
            onChange={(e) => setSearchProducto(e.target.value)}
          />
          <Button variant="contained" color="warning" onClick={() => setOpenFormProducto(true)}> Nueva Venta </Button>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>

          {/*Productos en la tienda*/}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" mb={4} fontWeight={600}>
              Productos en la tienda
            </Typography>

            <Stack spacing={2} mt={1}>
              {tiendaFiltrada.map((stock) => (
                <Paper key={stock.id} sx={{ p: 2, borderRadius: 3 }}>
                  <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                    <Stack spacing={2} mt={1}>
                      <Typography fontWeight={600}>{stock.producto.nombre}</Typography>
                      <Typography variant="body2">Descripcion: {stock.producto.descripcion}</Typography>
                      <Typography variant="body2">Precio Base: {stock.producto.precioBase.toFixed(2)} €</Typography>
                      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                        <Typography fontWeight={600}>Cantidad: </Typography>
                        <Typography variant="body2">{stock.cantidad || 0}</Typography>
                      </Stack>
                    </Stack>
                    <Stack spacing={2} mt={1}>
                      <Typography fontWeight={600}>Ubicacion</Typography>
                      <Typography variant="body2">Local: {stock.ubicacion.local.nombre}</Typography>
                      <Typography variant="body2">Ubicacion: {stock.ubicacion.tipo}</Typography>
                      <Typography variant="body2">Zona: {stock.ubicacion.descripcion}</Typography>
                    </Stack>                  
                  </Stack>
                  <Stack  direction = "row" spacing={2} mt={1}>
                    <Button variant="contained" >
                      Almacenar Producto
                    </Button>
                    {stock.cantidad===0 && <Button variant="contained" color="error" onClick={() => handleDeleteStock(stock.id)}>
                      Eliminar
                    </Button>}
                  </Stack>
                </Paper>
              ))}
            </Stack>        
          </Paper>

          
          {/*Historial de Ventas del vendedor*/}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" mb={4} fontWeight={600}>
              Historial de ventas
            </Typography>

            <Stack spacing={2} mt={1}>
              {tiendaFiltrada.map((stock) => (
                <Paper key={stock.id} sx={{ p: 2, borderRadius: 3 }}>
                  <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                    <Stack spacing={2} mt={1}>
                      <Typography fontWeight={600}>{stock.producto.nombre}</Typography>
                      <Typography variant="body2">Descripcion: {stock.producto.descripcion}</Typography>
                      <Typography variant="body2">Precio Base: {stock.producto.precioBase.toFixed(2)} €</Typography>
                      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                        <Typography fontWeight={600}>Cantidad: </Typography>
                        <Typography variant="body2">{stock.cantidad || 0}</Typography>
                      </Stack>
                    </Stack>
                    <Stack spacing={2} mt={1}>
                      <Typography fontWeight={600}>Ubicacion</Typography>
                      <Typography variant="body2">Local: {stock.ubicacion.local.nombre}</Typography>
                      <Typography variant="body2">Ubicacion: {stock.ubicacion.tipo}</Typography>
                      <Typography variant="body2">Zona: {stock.ubicacion.descripcion}</Typography>
                    </Stack>                  
                  </Stack>
                  <Stack  direction = "row" spacing={2} mt={1}>
                    <Button variant="contained">
                      Almacenar Producto
                    </Button>
                    {stock.cantidad===0 && <Button variant="contained" color="error" onClick={() => handleDeleteStock(stock.id)}>
                      Eliminar
                    </Button>}
                  </Stack>
                </Paper>
              ))}
            </Stack>        
          </Paper>
        </Stack>        
      </Paper>

      {/* Formulario Nueva venta */}
      <Dialog
        open={openFormProducto}
        onClose={() => setOpenFormProducto(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Nueva Venta
        </DialogTitle>

        <DialogContent>
          <TextField
            label="Buscar por nombre del local descripción o tipo "
            fullWidth
            value={searchUbicacion}
            onChange={(e) => setSearchUbicacion(e.target.value)}
          />
          <Stack direction="row" spacing={2} mt={1}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h4" mb={4} fontWeight={600}>
                Productos en tienda
              </Typography>
              <Stack spacing={2} mt={1}>
                {tiendaFiltrada.map((stock) => (
                  <Paper key={stock.id} sx={{ p: 2, borderRadius: 3 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                      <Stack spacing={2} mt={1}>
                        <Typography fontWeight={600}>{stock.producto.nombre}</Typography>
                        <Typography variant="body2">Descripcion: {stock.producto.descripcion}</Typography>
                        <Typography variant="body2">Precio Base: {stock.producto.precioBase.toFixed(2)} €</Typography>
                        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                          <Typography fontWeight={600}>Cantidad: </Typography>
                          <Typography variant="body2">{stock.cantidad || 0}</Typography>
                        </Stack>
                      </Stack>
                      <Stack spacing={2} mt={1}>
                        <Typography fontWeight={600}>Ubicacion</Typography>
                        <Typography variant="body2">Local: {stock.ubicacion.local.nombre}</Typography>
                        <Typography variant="body2">Ubicacion: {stock.ubicacion.tipo}</Typography>
                        <Typography variant="body2">Zona: {stock.ubicacion.descripcion}</Typography>
                      </Stack>                  
                    </Stack>
                    <Stack  direction = "row" spacing={2} mt={1}>
                      <Button variant="contained">
                        Añadir a la compra
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>      
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="h4" mb={4} fontWeight={600}>
                Lista de la compra
              </Typography>
              <Stack spacing={2} mt={1}>
                {tiendaFiltrada.map((stock) => (
                  <Paper key={stock.id} sx={{ p: 2, borderRadius: 3 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                      <Stack spacing={2} mt={1}>
                        <Typography fontWeight={600}>{stock.producto.nombre}</Typography>
                        <Typography variant="body2">Descripcion: {stock.producto.descripcion}</Typography>
                        <Typography variant="body2">Precio Base: {stock.producto.precioBase.toFixed(2)} €</Typography>
                        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                          <Typography fontWeight={600}>Cantidad: </Typography>
                          <Typography variant="body2">{stock.cantidad || 0}</Typography>
                        </Stack>
                      </Stack>
                      <Stack spacing={2} mt={1}>
                        <Typography fontWeight={600}>Ubicacion</Typography>
                        <Typography variant="body2">Local: {stock.ubicacion.local.nombre}</Typography>
                        <Typography variant="body2">Ubicacion: {stock.ubicacion.tipo}</Typography>
                        <Typography variant="body2">Zona: {stock.ubicacion.descripcion}</Typography>
                      </Stack>                  
                    </Stack>
                    <Stack  direction = "row" spacing={2} mt={1}>
                      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>  
                        <Button variant="contained" color="error" onClick={() => {movido?.cantidad>1 && setMovido({...movido, cantidad : movido?.cantidad - 1 });}}>
                          -
                        </Button>
                        <TextField value={movido?.cantidad ?? 1} onChange={(e) => {const cantidad = parseInt(e.target.value) || 1; setMovido({ ...movido, cantidad});}}/>
                        <Button variant="contained" color="success" onClick={() => {setMovido({...movido, cantidad : movido?.cantidad + 1 });}}>
                          +
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>      
            </Paper>
          </Stack>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Nombre Del Cliente (opcional)"
              value={formData.nombre || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nombre: e.target.value,
                })
              }
            />
            <TextField
              label="Codigo Descuento"
              value={formData.descripcion || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  descripcion: e.target.value,
                })
              }
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 4 }}>
              <Typography fontWeight={300}>Total sin iva: </Typography>
              <Typography variant="body2">19€</Typography>
            </Stack>
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 4 }}>
              <Typography fontWeight={300}>Total: </Typography>
              <Typography variant="body2">20€</Typography>
            </Stack>
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 4 }}>
              <Typography fontWeight={300}>Descuento aplicado: </Typography>
              <Typography variant="body2">20%</Typography>
            </Stack>
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 4 }}>
              <Typography fontWeight={600}>TOTAL: </Typography>
              <Typography variant="body2">18€</Typography>
            </Stack>

          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenFormProducto(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSubmitProducto}>
            Finalizar Venta
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mensaje Success */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={6000}
        onClose={() => setSuccessMsg("")}
      >
        <Alert severity="success">{successMsg}</Alert>
      </Snackbar>

      {/* Mensaje Error */} 
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={6000}
        onClose={() => setErrorMsg("")}
      >
        <Alert severity="error">{errorMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
