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

interface Venta {
  id: string;
  empleadoId: string;
  clienteId?: string;
  localId: string;
  fecha: Date;
  total: number;

  detalles: VentaDetalle[];
}

interface VentaDetalle{
  ventaId: string;
  productoId: string;
  cantidad: number;
  precioSinIva: number;
  descuento: number;
  precioFinal: number;
  producto: Producto;
  stockId: string;
}

interface Carrito{
  productoId: string,
  stockId: string,
  cantidad: number,
  precioSinIVA: number,
  precioConIVA: number,
  descuento: number,
  precioDescuento: number,
  precioFinal: number,
  producto :Producto,

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
  const [searchVenta, setSearchVenta] = useState("");
  const [openFormVenta, setOpenFormVenta] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState<any>({});
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [movido, setMovido] = useState<any>();
  const [mostrarDetalles, setMostrarDetalles] = useState(true);
  const [carrito, setCarrito] = useState<VentaDetalle[]>([]);

  const token = localStorage.getItem("accessToken");
  const user = token ? decodeToken(token) : null;
  const [usuarioCompleto, setUsuarioCompleto] = useState<any>(null);

 
  useEffect(() => {
    fetchStock();
    fetchVentas();
    fetchUsuario();
  }, []);

  const fetchStock = async () => {
    const stck = await api.get("/stock");
    setStocks(stck.data); 
  };

  const fetchVentas = async () => {
    const vents = await api.get ("/venta");
    setVentas(vents.data);

  };

  const fetchUsuario = async () => {
    const usr = await api.get(`/usuario/${user.sub}`);
    setUsuarioCompleto(usr.data);
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

  const ventasEmpleado = ventas.filter(
    (ventas) => ventas.empleadoId === user.id
  );

  const ventasFiltrada = ventas.filter((venta) => {
    const texto = searchVenta.toLowerCase();

    return (
      venta.id.toLowerCase().includes(texto) ||
      venta.empleadoId?.toLowerCase().includes(texto) ||
      venta.clienteId?.toLowerCase().includes(texto) ||
      venta.localId?.toLowerCase().includes(texto) ||
      venta.fecha.toLocaleDateString().toLowerCase().includes(texto)
    );
  });

  const handleSubmitVenta = async () => {

    if (carrito.length === 0) {
      setErrorMsg("El carrito está vacío");
      return;
    }
    
    try {
      const payload = {
        empleadoId: usuarioCompleto.empleadoId,
        localId: usuarioCompleto.empleado.localId,
        fecha: new Date(),
        clienteId : formData.clienteId,
        total: totales.final,

        detalles : carrito.map((detalle) => ({
          productoId: detalle.productoId,
          cantidad: detalle.cantidad,
          precioSinIVA: detalle.precioSinIva,
          descuento: detalle.descuento,
          precioFinal: detalle.precioFinal,
          stockId: detalle.stockId,
        }))
      };

      await api.post("/venta", payload);
      setSuccessMsg("Venta realizada correctamente");
      fetchVentas();
      fetchStock();
      setCarrito([]);
    } catch (error) {
      console.error("Error realizando la venta:", error);
      setErrorMsg("Error realizando la venta. Inténtalo de nuevo.");      
    }
    setOpenFormVenta(false);
  };

  const agregarAlCarrito = (carri : Carrito) => {

    for (let item of carrito) {
      if (item.productoId === carri.productoId) {
        item.cantidad = item.cantidad + carri.cantidad;
        item.precioSinIva = carri.precioSinIVA;
        item.descuento = carri.descuento;
        item.precioFinal = carri.precioFinal;
        item.stockId = carri.stockId;

        setCarrito([...carrito]);
        setFormData({});
        return;
      }
    } 

    setCarrito(prev => [
      ...prev,
      {
        productoId: carri.productoId,
        stockId: carri.stockId,
        cantidad: Number(carri.cantidad),
        precioSinIva: Number(carri.precioSinIVA),
        descuento: Number(carri.descuento),
        precioFinal: Number(carri.precioFinal),
        producto: carri.producto,
        ventaId: "",
      }
    ]);
    setFormData({});
  }

  const totales = carrito.reduce(
    (acc, item) => {
      const sinIVA = item.precioSinIva * item.cantidad;
      const conIVA =
        item.precioSinIva *
        (1 + item.producto.porcentajeIVA / 100) *
        item.cantidad;
      const descuento =
        (item.precioSinIva * item.descuento / 100) *
        item.cantidad;
      const final = item.precioFinal * item.cantidad;

      acc.sinIVA += sinIVA;
      acc.conIVA += conIVA;
      acc.descuento += descuento;
      acc.final += final;

      return acc;
    },
    { sinIVA: 0, conIVA: 0, descuento: 0, final: 0 }
  );

  return (
    <Box p={5}>
      <Paper  sx={{ p: 10 }}>
        <Typography variant="h4" mb={4} fontWeight={600}>
          Ventas al clientes
        </Typography>
    
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <Button variant="contained" color="warning" onClick={() => setOpenFormVenta(true)}> Nueva Venta </Button>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>

          {/*Productos en la tienda*/}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" mb={4} fontWeight={600}>
              Productos en la tienda
            </Typography>

            <TextField
              label="Buscar en la tienda por nombre descripción tipo o id"
              fullWidth
              value={searchProducto}
              onChange={(e) => setSearchProducto(e.target.value)}
            />  
    
            <Stack spacing={2} mt={1}>
              {tiendaFiltrada.map((stock) => (
                <Paper key={stock.id} sx={{ p: 2, borderRadius: 3 }}>
                  <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                    <Stack spacing={2} mt={1}>
                      <Typography fontWeight={600}>{stock.producto.nombre}</Typography>
                      <Typography variant="body2">Descripcion: {stock.producto.descripcion}</Typography>
                      <Typography variant="body2">Precio Base: {stock.producto.precioBase.toFixed(2)} €</Typography>
                      {(stock.descuento ?? 0) > 0 && (<Typography variant="body2">Descuento: {stock.descuento?.toString()}%</Typography>)}
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
                </Paper>
              ))}
            </Stack>        
          </Paper>
 
          {/*Historial de Ventas del vendedor*/}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" mb={4} fontWeight={600}>
              Historial de ventas
            </Typography>

            <TextField
              label="Buscar por ID empleado cliente local o fecha"
              fullWidth
              value={searchProducto}
              onChange={(e) => setSearchProducto(e.target.value)}
            />

            <Stack spacing={2} mt={1}>
              {ventasFiltrada.map((venta) => (
                <Paper key={venta.id } sx={{ p: 2, borderRadius: 3 }}>
                  <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                    <Stack spacing={2} mt={1}>
                      <Typography fontWeight={600}>Fecha: {new Date(venta.fecha).toLocaleDateString()}</Typography>
                      <Typography variant="body2">ID Empleado: {venta.empleadoId}</Typography>
                      <Typography variant="body2">ID CLiente: {venta.clienteId??"Null"} </Typography>
                      <Typography variant="body2">ID Local: {venta.localId??"Null"} </Typography>
                      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                        <Typography fontWeight={600}>Total: </Typography>
                        <Typography variant="body2">{venta.total || 0}</Typography>
                      </Stack>
                    </Stack>                  
                  </Stack>
                </Paper>
              ))}
            </Stack>        
          </Paper>
        </Stack>        
      </Paper>

      {/* Formulario Nueva venta */}
      <Dialog
        open={openFormVenta}
        onClose={() => setOpenFormVenta(false)}
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
                        {stock.producto.descuento&&<Typography variant="body2">Descuento: {stock.producto.descuento.toFixed(2)}%</Typography>}                        
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
                      <Button variant="contained" onClick={()=>{
                        const carrito: Carrito = {
                          productoId: stock.producto.id,
                          stockId: stock.id,
                          cantidad: 1,
                          precioSinIVA: stock.producto.precioBase,
                          precioConIVA: stock.producto.precioBase * (1 + stock.producto.porcentajeIVA / 100),
                          precioDescuento : stock.producto.precioBase * (stock.descuento / 100),
                          descuento: stock.descuento,
                          producto : stock.producto,
                          precioFinal: stock.producto.precioBase * (1 - stock.descuento / 100) * (1 + stock.producto.porcentajeIVA / 100)};
                        agregarAlCarrito(carrito)
                      }}>
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
                {carrito.map((detalle)=> (
                  <Paper key = {detalle.productoId} sx={{ p: 3, borderRadius: 3 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                      <Stack spacing={2} mt={1}>
                        <Typography fontWeight={600}>{detalle.producto?.nombre}</Typography>
                        <Typography variant="body2">Descripcion: {detalle.producto?.descripcion}</Typography>
                        <Typography variant="body2">Precio Base: {(detalle.precioSinIva).toFixed(2)} €</Typography>
                        <Typography variant="body2">IVA: {(detalle.producto.porcentajeIVA).toString()} %</Typography>
                        <Typography variant="body2">Descuento: {(detalle.descuento??0).toString()} %</Typography>
                        <Typography variant="body2">Precio Final: {(detalle.precioFinal).toFixed(2)} €</Typography>
                      </Stack>
                      <Stack spacing={2} mt={1}>
                        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>  
                          <Button variant="contained" color="error" onClick={() => {
                            detalle.cantidad = Math.max(0, detalle.cantidad - 1);
                            if (detalle.cantidad === 0) {
                              carrito.splice(carrito.findIndex(d => d.productoId === detalle.productoId), 1);
                            } 
                            setCarrito([...carrito]);

                          }}> - </Button>
                          <TextField value={ detalle.cantidad}  onChange={(e) => {
                            let nuevaCantidad = parseInt(e.target.value) || 0;
                            const stockMax = stocks.find(
                              s => s.producto.id === detalle.productoId &&
                              s.ubicacion.tipo === "TIENDA"
                            )?.cantidad ?? 0;
                            if (nuevaCantidad < 0) nuevaCantidad = 0;
                            if (nuevaCantidad > stockMax) nuevaCantidad = stockMax;
                            detalle.cantidad = nuevaCantidad;
                            if (detalle.cantidad === 0) {
                              carrito.splice(
                                carrito.findIndex(d => d.productoId === detalle.productoId),
                                1
                              );
                            }
                            setCarrito([...carrito]);
                          }} />
                          <Button variant="contained" color="success" onClick={() => {
                            const stockMax = stocks.find(
                              s => s.producto.id === detalle.productoId &&
                              s.ubicacion.tipo === "TIENDA"
                            )?.cantidad ?? 0;

                            if (detalle.cantidad < stockMax) {
                              detalle.cantidad = detalle.cantidad + 1;
                              setCarrito([...carrito]);
                            }
                          }}> + </Button>
                        </Stack>
                        <Typography variant="body2">Precio Total: {(detalle.precioFinal * detalle.cantidad).toFixed(2)} €</Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>      
            </Paper>
          </Stack>
          <Stack spacing={2} mt={1}>
            <TextField
              label="ID Del Cliente (opcional)"
              value={formData.clienteId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  clienteId: e.target.value,
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
              <Typography fontWeight={300}>Total sin IVA: </Typography>
              <Typography variant="body2">{totales.sinIVA.toFixed(2) ||0} €</Typography>
            </Stack>
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 4 }}>
              <Typography fontWeight={300}>Total(con IVA): </Typography>
              <Typography variant="body2">{totales.conIVA.toFixed(2)||0} €</Typography>
            </Stack>
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 4 }}>
              <Typography fontWeight={300}>Descuento aplicado: </Typography>
              <Typography variant="body2">{totales.descuento.toFixed(2)} €</Typography>
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 4 }}>
              <Typography fontWeight={600}>TOTAL: </Typography>
              <Typography variant="body2">{totales.final.toFixed(2)} €</Typography>
            </Stack>

          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenFormVenta(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSubmitVenta}>
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
