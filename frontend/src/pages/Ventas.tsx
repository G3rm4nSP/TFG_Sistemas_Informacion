import { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions,  Grid, Tabs, Tab, Divider } from "@mui/material";
import { api } from "../api/axios";
import { fetchUsuario, logout } from "../services/userService";
import { useNavigate } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AppHeader from "../components/generals/AppHeader";
import StockCard from "../components/Stock/StockCard";
import TicketVentaCard from "../components/Venta/TicketVentaCard";
import AppSnackbars from "../components/generals/AppSnackbars";
import CarritoItem from "../components/Venta/ItemCarritoCard";
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

export default function Ventas() {
  const [searchProducto, setSearchProducto] = useState("");
  const [searchVenta, setSearchVenta] = useState("");
  const [openFormVenta, setOpenFormVenta] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState<any>({});
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [carrito, setCarrito] = useState<VentaDetalle[]>([]);
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
    vents.data.sort((a:any, b:any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
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

  const stocksAlmacen = stocks.filter(
    (stock) => stock.ubicacion.tipo === "ALMACEN"
  );
  
  const almacenFiltrado = stocksAlmacen.filter((stock) => {
    const texto = searchProducto.toLowerCase();

    return (
      stock.producto.nombre.toLowerCase().includes(texto) ||
      stock.producto.tipo.toLowerCase().includes(texto) ||
      stock.producto.descripcion.toLowerCase().includes(texto) ||
      stock.producto.id.toLowerCase().includes(texto)
    );
  });

  const ventasFiltrada = ventas.filter((venta) => {
    const texto = searchVenta.toLowerCase();
    const fecha = new Date(venta.fecha);

    const searchableDate = `
      ${fecha.toLocaleDateString("es-ES")}
      ${fecha.toLocaleDateString("es-ES", { month: "long" })}
      ${fecha.getFullYear()}
    `
      .toLowerCase();  
    return (
      venta.id.toLowerCase().includes(texto) ||
      venta.empleado?.nombre.toLowerCase().includes(texto) ||
      venta.empleado?.apellidos.toLowerCase().includes(texto) ||
      venta.local?.nombre.toLowerCase().includes(texto) ||
      venta.detalles.some((detalle:any) => detalle.producto?.nombre.toLowerCase().includes(texto)) ||
      searchableDate.includes(texto)
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

  const actualizarCantidad = ( stockId: string,nuevaCantidad: number ) => {
    const stockMax =
      stocks.find(
        (s) =>
          s.id === stockId
      )?.cantidad ?? 0;

    nuevaCantidad = Math.max(0, Math.min(nuevaCantidad, stockMax));

    const nuevoCarrito = carrito
      .map((d) =>
        d.stockId === stockId
          ? { ...d, cantidad: nuevaCantidad }
          : d
      )
      .filter((d) => d.cantidad > 0);

    setCarrito(nuevoCarrito);
  };

  const agregarAlCarrito = (carri : Carrito) => {
    

    for (let item of carrito) {
      if (item.stockId === carri.stockId) {
        if (item.cantidad < carri.cantidad) {
          item.cantidad = item.cantidad + 1;
          item.precioSinIva = carri.precioSinIVA;
          item.descuento = carri.descuento;
          item.precioFinal = carri.precioFinal;
          item.stockId = carri.stockId;
          setCarrito([...carrito]);
          setFormData({});
          setSuccessMsg(`${carri.producto.nombre} ${item.cantidad} uds`);
        }else{
          setErrorMsg(`No hay suficiente stock de ${carri.producto.nombre}`);
        }
        return;
      }
    } 

    setCarrito(prev => [
      ...prev,
      {
        productoId: carri.productoId,
        stockId: carri.stockId,
        cantidad: 1,
        precioSinIva: Number(carri.precioSinIVA),
        descuento: Number(carri.descuento),
        precioFinal: Number(carri.precioFinal),
        producto: carri.producto,
        ventaId: "",
      }
    ]);
    setFormData({});
    setSuccessMsg(`${carri.producto.nombre} 1 ud`);

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--background)" }}>
      <AppHeader titulo="VISTA STOCK" icon={<ShoppingCartIcon />} usuario={usuarioCompleto} onLogout={handleLogout} />

      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid #e0e0e0" }}>
            <Tab label={`Historial (${ventasFiltrada.length})`} />
            <Tab label="Productos" />
          </Tabs>
          <Button variant="contained" startIcon={<ShoppingCartIcon />} onClick={() => setOpenFormVenta(true)} sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            Nueva Venta
          </Button>
          {tab === 0 && (
            <Stack spacing={2}>
              <TextField placeholder="Buscar por ID, cliente, local..." value={searchVenta} onChange={(e) => setSearchVenta(e.target.value)} fullWidth size="small" />
              {ventasFiltrada.map((venta) => (
                  <TicketVentaCard venta={venta} />
              ))}
            </Stack>
          )}

          {tab === 1 && (
            <Stack spacing={3}>
              <TextField placeholder="Buscar productos..." value={searchProducto} onChange={(e) => setSearchProducto(e.target.value)} fullWidth size="small" />
              <Grid container spacing={2}>
                {tiendaFiltrada.map((stock) => (
                  (stock.cantidad > 0) ? (
                      <StockCard
                        stock={stock}
                        isVenta={true}
                        onSale={() => {
                          const carri: Carrito = {
                            productoId: stock.producto.id,
                            stockId: stock.id,
                            cantidad: stock.cantidad,
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
                  ) : null
                ))}
              </Grid>
            </Stack>
          )}

        </Stack>
      </Box>

      <Dialog open={openFormVenta} onClose={() => setOpenFormVenta(false)} maxWidth="md" fullWidth PaperProps={{ sx: { maxHeight: "90vh" } }}>
        <DialogTitle>Nueva Venta</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Tabs value={tabVentas} onChange={(_, v) => setTabVentas(v)}>
              <Tab label={`Carrito (${carrito.length})`} />
              <Tab label={`Productos en almacen (${tiendaFiltrada.length})`} />
            </Tabs>
            
            {tabVentas === 0 && (
              <Stack spacing={2} sx={{ maxHeight: "400px", overflowY: "auto" }}>
                {carrito.length === 0 ? (
                  <Typography color="textSecondary" sx={{ textAlign: "center", py: 3 }}>
                    El carrito está vacío
                  </Typography>
                ) : (
                  carrito.map((detalle) => (
                    <CarritoItem
                      key={detalle.stockId}
                      detalle={detalle}
                      onQuantityChange={(qty) => actualizarCantidad(detalle.stockId, qty)}
                      onRemove={() => actualizarCantidad(detalle.stockId, 0)}
                    />
                  ))
                )}
              </Stack>
            )} 

            {tabVentas === 1 && (
              <Stack spacing={2}>
                <TextField placeholder="Buscar productos..." value={searchProducto} onChange={(e) => setSearchProducto(e.target.value)} fullWidth size="small" />
                <Grid container spacing={2}>
                  {almacenFiltrado.map((stock) => (
                    (stock.cantidad > 0) ? (
                        <StockCard
                          stock={stock}
                          isVenta={true}
                          onSale={() => {
                            const carri: Carrito = {
                              productoId: stock.producto.id,
                              stockId: stock.id,
                              cantidad: stock.cantidad,
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
                    ) : null
                  ))}
                </Grid>
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

      <AppSnackbars successMsg={successMsg} errorMsg={errorMsg} setSuccessMsg={setSuccessMsg} setErrorMsg={setErrorMsg}/>  
    </Box>
  );
}
