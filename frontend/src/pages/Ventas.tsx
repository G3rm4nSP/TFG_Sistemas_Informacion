import { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, AppBar, Toolbar, Grid, Tabs, Tab, Card, CardContent, Chip, Divider, useTheme, useMediaQuery, Collapse, IconButton } from "@mui/material";
import { api } from "../api/axios";
import { fetchUsuario, logout } from "../services/userService";
import { useNavigate } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AppHeader from "../components/generals/AppHeader";
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
  cliente :any,
  empleado: any,
  local : any,

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
  const [expandedVenta, setExpandedVenta] = useState<{[key: string]: boolean}>({});
  const [carrito, setCarrito] = useState<VentaDetalle[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [usuarioCompleto, setUsuarioCompleto] = useState<any>(null);
  const [tab, setTab] = useState(0);
  const [tabVentas, setTabVentas] = useState(0);

  const navigate = useNavigate();

 
  useEffect(() => {
    fetchStock();
    fetchVentas();
    const cargar = async () => {
          const usuario = await fetchUsuario(navigate);
          setUsuarioCompleto(usuario);
        };
        cargar();

  }, []);

  const fetchStock = async () => {
    const stck = await api.get("/stock");
    setStocks(stck.data); 
  };

  const fetchVentas = async () => {
    const vents = await api.get ("/venta");
    setVentas(vents.data);

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
    (ventas) => ventas.empleadoId === usuarioCompleto.empleadoId
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

  const actualizarCantidad = ( productoId: string,nuevaCantidad: number ) => {
    const stockMax =
      stocks.find(
        (s) =>
          s.producto.id === productoId &&
          s.ubicacion.tipo === "TIENDA"
      )?.cantidad ?? 0;

    nuevaCantidad = Math.max(0, Math.min(nuevaCantidad, stockMax));

    const nuevoCarrito = carrito
      .map((d) =>
        d.productoId === productoId
          ? { ...d, cantidad: nuevaCantidad }
          : d
      )
      .filter((d) => d.cantidad > 0);

    setCarrito(nuevoCarrito);
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

  const handleLogout = () => {
    logout(navigate);
  };

  const ProductCard = ({ stock, onAdd }: any) => (
    <Card sx={{ borderLeft: "4px solid #667eea", h: "100%" }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#667eea", mb: 1 }}>
          {stock.producto.nombre}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          {stock.producto.descripcion}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <Chip label={`${stock.cantidad} uds`} size="small" variant="outlined" />
          {stock.descuento > 0 && <Chip label={`${stock.descuento}% desc.`} size="small" color="error" variant="filled" />}
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2">
            <strong>{stock.producto.precioBase.toFixed(2)}€</strong>
          </Typography>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
            Añadir
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  const CarritoItem = ({ detalle, onQuantityChange, onRemove }: any) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "start" }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {detalle.producto?.nombre}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {detalle.producto?.descripcion}
              </Typography>
            </Box>
            <IconButton size="small" color="error" onClick={onRemove}>
              <DeleteIcon />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Button size="small" variant="outlined" onClick={() => onQuantityChange(detalle.cantidad - 1)}>
                <RemoveIcon sx={{ fontSize: 16 }} />
              </Button>
              <TextField
                type="number"
                value={detalle.cantidad}
                onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
                sx={{ width: 60, "& input": { textAlign: "center" } }}
                size="small"
              />
              <Button size="small" variant="outlined" onClick={() => onQuantityChange(detalle.cantidad + 1)}>
                <AddIcon sx={{ fontSize: 16 }} />
              </Button>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {(detalle.precioFinal * detalle.cantidad).toFixed(2)}€
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ fontSize: "0.85rem" }}>
            <Typography variant="caption">Base: {detalle.precioSinIva.toFixed(2)}€</Typography>
            {detalle.descuento > 0 && <Typography variant="caption" sx={{ color: "error.main" }}>Desc: {detalle.descuento}%</Typography>}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--background)" }}>
      <AppHeader titulo="VISTA STOCK" icon={<ShoppingCartIcon />} usuario={usuarioCompleto} onLogout={handleLogout} />

      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid #e0e0e0" }}>
            <Tab label="Productos" />
            <Tab label={`Historial (${ventasFiltrada.length})`} />
          </Tabs>

          {tab === 0 && (
            <Stack spacing={3}>
              <Button variant="contained" startIcon={<ShoppingCartIcon />} onClick={() => setOpenFormVenta(true)} sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                Nueva Venta
              </Button>

              <TextField placeholder="Buscar productos..." value={searchProducto} onChange={(e) => setSearchProducto(e.target.value)} fullWidth size="small" />

              <Grid container spacing={2}>
                {tiendaFiltrada.map((stock) => (
                  <Grid item xs={12} sm={6} md={4} key={stock.id}>
                    <ProductCard
                      stock={stock}
                      onAdd={() => {
                        const carri: Carrito = {
                          productoId: stock.producto.id,
                          stockId: stock.id,
                          cantidad: 1,
                          precioSinIVA: stock.producto.precioBase,
                          precioConIVA: stock.producto.precioBase * (1 + stock.producto.porcentajeIVA / 100),
                          precioDescuento: stock.producto.precioBase * (stock.descuento / 100),
                          descuento: stock.descuento,
                          producto: stock.producto,
                          precioFinal: stock.producto.precioBase * (1 - stock.descuento / 100) * (1 + stock.producto.porcentajeIVA / 100),
                        };
                        agregarAlCarrito(carri);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          )}

          {tab === 1 && (
            <Stack spacing={2}>
              <TextField placeholder="Buscar por ID, cliente, local..." value={searchVenta} onChange={(e) => setSearchVenta(e.target.value)} fullWidth size="small" />

              {ventasFiltrada.map((venta) => (
                <Card key={venta.id}>
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "#f5f5f5" },
                      }}
                      onClick={() => setExpandedVenta((prev) => ({ ...prev, [venta.id]: !prev[venta.id] }))}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Stack spacing={0.5}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {new Date(venta.fecha).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {venta.empleado.nombre} {venta.empleado.apellidos} - {venta.local.nombre}
                          </Typography>
                          {venta.cliente && <Typography variant="body2">Cliente: {venta.cliente.nombre}</Typography>}
                        </Stack>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#667eea" }}>
                          {venta.total.toFixed(2)}€
                        </Typography>
                        <Typography variant="caption">{venta.detalles.length} productos</Typography>
                      </Box>
                      <ExpandMoreIcon sx={{ transform: expandedVenta[venta.id] ? "rotate(180deg)" : "rotate(0deg)", transition: "all 0.2s" }} />
                    </Stack>

                    <Collapse in={expandedVenta[venta.id]} sx={{ mt: 2 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={1}>
                        {venta.detalles.map((detalle) => (
                          <Paper key={detalle.productoId} sx={{ p: 1.5, backgroundColor: "#f9f9f9" }}>
                            <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between" }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {detalle.producto?.nombre}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {detalle.cantidad} x {detalle.precioFinal.toFixed(2)}€
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {(detalle.cantidad * detalle.precioFinal).toFixed(2)}€
                              </Typography>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Collapse>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Box>

      <Dialog open={openFormVenta} onClose={() => setOpenFormVenta(false)} maxWidth="md" fullWidth PaperProps={{ sx: { maxHeight: "90vh" } }}>
        <DialogTitle>Nueva Venta</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Tabs value={tabVentas} onChange={(_, v) => setTabVentas(v)}>
              <Tab label={`Productos (${tiendaFiltrada.length})`} />
              <Tab label={`Carrito (${carrito.length})`} />
            </Tabs>

            {tabVentas === 0 && (
              <Stack spacing={2}>
                <TextField placeholder="Buscar productos..." value={searchProducto} onChange={(e) => setSearchProducto(e.target.value)} fullWidth size="small" />
                <Grid container spacing={2}>
                  {tiendaFiltrada.map((stock) => (
                    <Grid item xs={12} sm={6} key={stock.id}>
                      <ProductCard
                        stock={stock}
                        onAdd={() => {
                          const carri: Carrito = {
                            productoId: stock.producto.id,
                            stockId: stock.id,
                            cantidad: 1,
                            precioSinIVA: stock.producto.precioBase,
                            precioConIVA: stock.producto.precioBase * (1 + stock.producto.porcentajeIVA / 100),
                            precioDescuento: stock.producto.precioBase * (stock.descuento / 100),
                            descuento: stock.descuento,
                            producto: stock.producto,
                            precioFinal: stock.producto.precioBase * (1 - stock.descuento / 100) * (1 + stock.producto.porcentajeIVA / 100),
                          };
                          agregarAlCarrito(carri);
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            )}

            {tabVentas === 1 && (
              <Stack spacing={2} sx={{ maxHeight: "400px", overflowY: "auto" }}>
                {carrito.length === 0 ? (
                  <Typography color="textSecondary" sx={{ textAlign: "center", py: 3 }}>
                    El carrito está vacío
                  </Typography>
                ) : (
                  carrito.map((detalle) => (
                    <CarritoItem
                      key={detalle.productoId}
                      detalle={detalle}
                      onQuantityChange={(qty) => actualizarCantidad(detalle.productoId, qty)}
                      onRemove={() => actualizarCantidad(detalle.productoId, 0)}
                    />
                  ))
                )}
              </Stack>
            )}

            <Divider />

            <TextField
              label="ID Cliente (opcional)"
              value={formData.clienteId || ""}
              onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
              fullWidth
              size="small"
            />

            <Paper sx={{ p: 2, backgroundColor: "#f5f7fa" }}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
                  <Typography variant="body2">Total sin IVA:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {totales.sinIVA.toFixed(2)}€
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
                  <Typography variant="body2">IVA:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {(totales.conIVA - totales.sinIVA).toFixed(2)}€
                  </Typography>
                </Stack>
                {totales.descuento > 0 && (
                  <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ color: "error.main" }}>
                      Descuento:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "error.main" }}>
                      -{totales.descuento.toFixed(2)}€
                    </Typography>
                  </Stack>
                )}
                <Divider />
                <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    TOTAL:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#667eea" }}>
                    {totales.final.toFixed(2)}€
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFormVenta(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmitVenta} disabled={carrito.length === 0}>
            Finalizar Venta
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!successMsg} autoHideDuration={6000} onClose={() => setSuccessMsg("")}>
        <Alert severity="success">{successMsg}</Alert>
      </Snackbar>
      <Snackbar open={!!errorMsg} autoHideDuration={6000} onClose={() => setErrorMsg("")}>
        <Alert severity="error">{errorMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
