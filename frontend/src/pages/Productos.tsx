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

export default function ProductosPage() {
  const [searchProducto, setSearchProducto] = useState("");
  const [searchUbicacion, setSearchUbicacion] = useState("");
  const [openFormNuevaUbicacion, setOpenFormNuevaUbicacion] = useState(false);
  const [openListaUbicaciones, setOpenListaUbicaciones] = useState (false);
  const [openFormProducto, setOpenFormProducto] = useState(false);
  const [openFormMoverStock, setOpenFormMoverStock] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [catalogoProductos, setCatalogoProductos] = useState<Producto[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [formDataUbi, setFormDataUbi] = useState<any>({});
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [movido, setMovido] = useState<any>();
  const [origenId, setOrigenId] = useState("");
  const [ubisAMover, setUbisAMover] = useState<Stock[]>([]);


  const token = localStorage.getItem("accessToken");
  const user = token ? decodeToken(token) : null;

 
  useEffect(() => {
    fetchCatalogoProductos();
    fetchStock();
    fetchUbicaciones();
  }, []);

  const fetchStock = async () => {
    const stck = await api.get("/stock");
    setStocks(stck.data); 
  };

  const fetchCatalogoProductos = async () => {
    const productos = await api.get("/producto");
    setCatalogoProductos(productos.data);
  };

  const fetchUbicaciones = async () => {
    const ubis = await api.get("/ubicacion");
    setUbicaciones(ubis.data);
  }

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
  
  const productosFiltrados = catalogoProductos.filter((producto) =>{
    const texto = searchProducto.toLowerCase();

    return (
      producto.nombre.toLowerCase().includes(texto) ||
      producto.descripcion.toLowerCase().includes(texto)
    );
  });

  const ubicacionesFiltradas = ubicaciones.filter((ubicacion) =>{
    const texto = searchUbicacion.toLowerCase();

    return (
      ubicacion.local.nombre.toLowerCase().includes(texto) ||
      ubicacion.tipo.toLowerCase().includes(texto) ||
      ubicacion.descripcion.toLowerCase().includes(texto)
    );
  });

  const handleSubmitUbicacion = async () => {
    const payloadUbi = {
      localId : formDataUbi.localId,
      tipo : formDataUbi.tipo,
      descripcion : formDataUbi.descripcion,
    }

    const ubi = await api.post ("/ubicacion", payloadUbi);
    setSuccessMsg("Ubicacion creada correctamente");

    // Mover stock directamente con la nueva ubicación
    const payloadMove = {
      productoId: movido?.productoId,
      destinoUbicacionId: ubi.data.id,
      cantidad: movido?.cantidad,
    };

    try {
      await api.patch(`/stock/mover/${origenId}`, payloadMove);
      setSuccessMsg("Stock movido correctamente");
    } catch (error) {
      console.error("Error moviendo stock:", error);
      setErrorMsg("Error al mover el stock. Inténtalo de nuevo.");
    }

    setOpenFormNuevaUbicacion(false);
    setOpenListaUbicaciones(false);
    fetchStock();
    fetchUbicaciones();
    setFormDataUbi({});
    setMovido(undefined);
    setOrigenId("");
  }

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

  const moverStock = (stock : Stock) =>{
    setOrigenId(stock.id),
    setUbisAMover(stocks.filter(s => s.producto.id === stock.producto.id && s.ubicacion.tipo !== stock.ubicacion.tipo),
)
    setMovido({
      cantidad: 1,
      productoId: stock.producto.id,
      nombre: stock.producto.nombre,
      destinoUbicacionId: ""
    })
    setOpenFormMoverStock(true);
  }

  const handleMoveStock = async (ubicacionId : String) => {
    try {
      const payload = {
        productoId: movido.productoId,
        destinoUbicacionId: ubicacionId,
        cantidad: movido.cantidad,
      };

      await api.patch(`/stock/mover/${origenId}`, payload);
      setSuccessMsg("Producto movido correctamente")

    } catch (error) {
      console.error("Error moviendo stock:", error);
      setErrorMsg("Error al mover el stock. Inténtalo de nuevo.");
    }
    setOpenFormMoverStock(false);
    setOpenListaUbicaciones(false);
    fetchStock();
    setMovido(undefined);
    setOrigenId("");
  };

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
          <Button variant="contained" color="warning" onClick={() => setOpenFormProducto(true)}> Nuevo Producto </Button>
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
                    <Button variant="contained" onClick={() => moverStock(stock)}>
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

          {/* Productos en el almacen*/}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" mb={4} fontWeight={600}>
              Productos en el Almacen
            </Typography>

            <Stack spacing={2} mt={1}>
              {almacenFiltrado.map((stock) => (
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
                    <Button variant="contained" onClick={() => moverStock(stock)}>
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

          {/*Productos en catálogo*/}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" mb={4} fontWeight={600}>
              Catalogo de productos
            </Typography>

            <Stack spacing={2} mt={1}>
                {productosFiltrados.map((producto)=> (
                  <Paper key = {producto.id} sx={{ p: 2, borderRadius: 3 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                      <Stack spacing={2} mt={1}>
                        <Typography fontWeight={600}>{producto.nombre}</Typography>
                        <Typography variant="body2">Descripcion: {producto.descripcion}</Typography>
                        <Typography variant="body2">Precio Base: {producto.precioBase.toFixed(2)} €</Typography>
                      </Stack>
                      <Stack spacing={2} mt={1}>
                        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                          <Typography fontWeight={600}>Cantidad: </Typography>
                          <Typography variant="body2">{producto.stocks.reduce((total, stock) => total + stock.cantidad, 0)}</Typography>
                        </Stack>
                      </Stack>                  
                    </Stack>
                  </Paper>
                ))}
              </Stack>        
          </Paper>
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

      {/* Formulario Mover Producto */}
      <Dialog
        open={openFormMoverStock}
        onClose={() => setOpenFormMoverStock(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Mover {movido?.nombre}
        </DialogTitle>
      
        <DialogContent>
          <Typography fontWeight={600}>Selecciona una cantidad a mover</Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 4 }}>  
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setMovido({
                  ...movido, 
                  cantidad : movido?.cantidad - 1
                }
                );
              }}
            >
              -
            </Button>
            <TextField
              value={movido?.cantidad ?? 1}
              onChange={(e) => {
                const cantidad = parseInt(e.target.value) || 1;
                setMovido({
                  ...movido, 
                  cantidad
                });
              }}
            />
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                setMovido({
                  ...movido, 
                  cantidad : movido?.cantidad + 1
                }
                );
              }}
            >
              +
            </Button>
          </Stack>

          <Typography fontWeight={600}>Selecciona un Stock donde moverlo</Typography>       

          <Stack spacing={2} mt={1}>
            {ubisAMover.map((stock) => (
              <Paper key={stock.id} sx={{ p: 2, borderRadius: 3 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                  <Stack spacing={2} mt={1}>
                    <Typography fontWeight={600}>{stock.producto.nombre}</Typography>
                    <Typography variant="body2">Descripcion: {stock.ubicacion.descripcion}</Typography>
                    <Typography variant="body2">Cantidad: {stock.cantidad || 0}</Typography>
                    <Typography variant="body2">Tipo: {stock.ubicacionId}</Typography>
                  </Stack>
                  <Stack spacing={2} mt={1}>
                    <Button variant="contained" onClick={ () => {                      
                      handleMoveStock(stock.ubicacionId);
                    }
                    }>
                      Mover Aqui
                    </Button>
                  </Stack>                  
                </Stack>
              </Paper>
              ))}    
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenFormMoverStock(false)}>
            Cancelar
          </Button>
          <Button onClick={() => {
            setOpenListaUbicaciones(true);
            setOpenFormMoverStock(false);
          }}>
            Elegir ubicación vacia
          </Button>
        </DialogActions>
      </Dialog>

      {/* Catalogo Ubicaciones disponibles */}
      <Dialog
        open={openListaUbicaciones}
        onClose={() => setOpenListaUbicaciones(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Ubicaciones Disponibles
        </DialogTitle>

        <DialogContent>
          <TextField
            label="Buscar por nombre del local descripción o tipo "
            fullWidth
            value={searchUbicacion}
            onChange={(e) => setSearchUbicacion(e.target.value)}
          />
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" mb={4} fontWeight={600}>
              Catalogo de Ubicaciones
            </Typography>

            <Stack spacing={2} mt={1}>
                {ubicacionesFiltradas.map((ubicacion)=> (
                  <Paper key = {ubicacion.id} sx={{ p: 2, borderRadius: 3 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                      <Stack spacing={2} mt={1}>
                        <Typography fontWeight={600}>{ubicacion.local.nombre}</Typography>
                        <Typography variant="body2">Local ID: {ubicacion.localId}</Typography>
                        <Typography variant="body2">Tipo: {ubicacion.tipo}</Typography>
                        <Typography variant="body2">Zona: {ubicacion.descripcion}</Typography>
                      </Stack>
                      <Stack spacing={2} mt={1}>
                        <Button variant="contained" color= "success" onClick={() => {
                          setOpenListaUbicaciones(false);
                          handleMoveStock(ubicacion.id);
                        }}> Mover Aqui </Button>
                      </Stack>                  
                    </Stack>
                  </Paper>
                ))}
              </Stack>        
          </Paper>
       
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenListaUbicaciones(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => {
            setOpenListaUbicaciones(false);
            setOpenFormNuevaUbicacion(true);
          }}>
            Crear Nueva Ubicacion
          </Button>
        </DialogActions>
      </Dialog>   
        
      {/* Formulario Nueva Ubicacion */}
      <Dialog
        open={openFormNuevaUbicacion}
        onClose={() => setOpenFormNuevaUbicacion(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Nueva Ubicacion
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Local Id"
              value={formDataUbi.localId || ""}
              onChange={(e) =>
                setFormDataUbi({
                  ...formDataUbi,
                  localId: e.target.value,
                })
              }
            />
            <TextField
              label="Descripcion"
              value={formDataUbi.descripcion || ""}
              onChange={(e) =>
                setFormDataUbi({
                  ...formDataUbi,
                  descripcion: e.target.value,
                })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={formDataUbi.tipo || ""}
                onChange={(e) =>
                  setFormDataUbi({
                    ...formDataUbi,
                    tipo: e.target.value,
                  })
                }
              >
              <MenuItem value="ALMACEN">ALMACEN</MenuItem>
              <MenuItem value="TIENDA">TIENDA</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenFormNuevaUbicacion(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => {
            handleSubmitUbicacion();
          }}>
            Guardar
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
