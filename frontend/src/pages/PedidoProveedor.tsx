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
  useTheme,
  useMediaQuery,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";
import { fetchUsuario, logout } from "../services/userService";
import AppHeader from "../components/generals/AppHeader";
import AppSnackbars from "../components/generals/AppSnackbars";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TicketCompraCard from "../components/Compra/TicketCompraCard";
import StockCard from "../components/Stock/StockCard";
import { AgregarAlCarrito } from "../components/Proveedor/AgregarAlCarrito";

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

interface CompraDetalle {
  id?: string;
  compraId: string;
  productoId: string;
  cantidad: number;
  precioUnidad: number;
  expiracion?: Date;
  producto?: Producto;
}

interface Compra {
  id: string;
  empleadoId: string;
  proveedorId: string;
  localId: string;
  fecha: string;
  total: number;
  detalles: CompraDetalle[];
  empleado: any;
  local: any;
}

export default function PedidoProveedor() {
  const { provId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [proveedor, setProveedor] = useState<any>(null);
  const [usuarioCompleto, setUsuarioCompleto] = useState<any>(null);
  const [historicoCompras, setHistoricoCompras] = useState<Compra[]>([]);
  const [search, setSearch] = useState("");
  const [searchProducto, setSearchProducto] = useState("");
  const [carrito, setCarrito] = useState<CompraDetalle[]>([]);
  const [openCarrito, setOpenCarrito] = useState(false);
  const [openFormCantidad, setOpenFormCantidad] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [catalogoProductos, setCatalogoProductos] = useState<Producto[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [tab, setTab] = useState(0);
  const [detallesPendientes, setDetallesPendientes] = useState<CompraDetalle[]>([]);
  
  useEffect(() => {
    fetchProveedor();
    const cargar = async () => {
      const usuario = await fetchUsuario(navigate);
      setUsuarioCompleto(usuario);
    };
    cargar();
  }, [navigate]);

  useEffect(() => {
    if (proveedor?.id && usuarioCompleto?.empleado?.localId) {
      fetchHistoricoCompras();
    }
  }, [proveedor, usuarioCompleto]);

  const fetchProveedor = async () => {
    const prov = await api.get(`/proveedor/${provId}`);
    setProveedor(prov.data);
  };

  const fetchHistoricoCompras = async () => {
    const compras = await api.get("/compra", {
      params: {
        proveedorId: proveedor.id,
        localId: usuarioCompleto.empleado.localId,
      },
    });
    compras.data.sort((a: Compra, b: Compra) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    setHistoricoCompras(compras.data);
  };

  const fetchCatalogoProductos = async () => {
    const productos = await api.get("/producto");
    setCatalogoProductos(productos.data);
  };

  const detallesAplanados = useMemo(() => {
    return historicoCompras.flatMap((compra) =>
      compra.detalles.map((detalle) => ({
        ...detalle,
        fecha: compra.fecha,
        compraId: compra.id,
        expiracion: detalle.producto?.expiracion,
      }))
    );
  }, [historicoCompras]);

  useEffect(() => {
    fetchCatalogoProductos();
  }, []);

  const productosFiltrados = catalogoProductos.filter((producto) =>{
    const texto = searchProducto.toLowerCase();

    return (
      producto.nombre.toLowerCase().includes(texto) ||
      producto.descripcion.toLowerCase().includes(texto)
    );
  });

  const detallesFiltrados = detallesAplanados.filter((detalle) => {
    const texto = search.toLowerCase();

    return (
      new Date(detalle.fecha)
        .toISOString()
        .split("T")[0]
        .includes(texto) ||
      detalle.producto?.nombre?.toLowerCase().includes(texto)
    );
  });

  const comprasFiltradas = historicoCompras.filter((compra) => {
    const texto = search.toLowerCase();
    const fecha = new Date(compra.fecha);

    const searchableDate = `
      ${fecha.toLocaleDateString("es-ES")}
      ${fecha.toLocaleDateString("es-ES", { month: "long" })}
      ${fecha.getFullYear()}
    `
      .toLowerCase();  
    return (
      compra.id.toLowerCase().includes(texto) ||
      compra.empleado?.nombre.toLowerCase().includes(texto) ||
      compra.empleado?.apellidos.toLowerCase().includes(texto) ||
      compra.local?.nombre.toLowerCase().includes(texto) ||
      compra.detalles.some((detalle:any) => detalle.producto?.nombre.toLowerCase().includes(texto)) ||
      searchableDate.includes(texto)
    );
  });

  const handleSubmitCompra = async () => {

    if (carrito.length === 0) {
      setSuccessMsg("El carrito está vacío");
      return;
    }

    const payload = {
      proveedorId: proveedor.id,
      localId: usuarioCompleto.empleado.localId,
      fecha: new Date(),
      total: CalcularTotalCarrito(),
      empleadoId: usuarioCompleto.empleadoId,

      detalles : carrito.map((detalle) => ({
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        precioUnidad: detalle.precioUnidad
      }))
    };
    await api.post("/compra", payload);
    setSuccessMsg("Pedido realizado correctamente");
    setOpenCarrito(false);
    fetchHistoricoCompras();
    setCarrito([]);
  };

  const CalcularTotalCarrito = () => {
    return carrito.reduce((total, detalle) => total + detalle.precioUnidad * detalle.cantidad, 0);
  };

  const handleLogout = () => {
    logout(navigate);
  };

  const agregarProducto = (producto: Producto) => {  

    setFormData({
      ...formData,
      cantidad: 1,
      nombre : producto.nombre,
      productoId: producto.id,
      producto: producto,
      expiracion: producto.expiracion ? new Date(producto.expiracion) : null,
    });
    setOpenFormCantidad(true);
  }

  const agregarDetalle = (detalle: CompraDetalle) => {
    setFormData({
      ...formData,
      cantidad: detalle.cantidad,
      precioUnidad: detalle.precioUnidad,
      nombre : detalle.producto?.nombre,
      productoId: detalle.productoId,
      producto: detalle.producto,
      expiracion: detalle.expiracion ? new Date(detalle.expiracion) : null,
    });
    setOpenFormCantidad(true);
  }

  useEffect(() => {

    if (
      detallesPendientes.length > 0 &&
      !openFormCantidad
    ) {

      agregarDetalle(detallesPendientes[0]);

      setDetallesPendientes((prev) => prev.slice(1));
    }

  }, [detallesPendientes, openFormCantidad]);

  const agregarAlCarrito = () => {

    if (!formData.productoId || !formData.cantidad || !formData.precioUnidad) {
      setErrorMsg("Completa todos los campos para añadir al carrito");
      return;
    }

    for (let item of carrito) {
      if (item.productoId === formData.productoId) {
        item.cantidad = item.cantidad + formData.cantidad;
        item.precioUnidad = parseFloat(formData.precioUnidad) || 0;
        item.expiracion = formData.expiracion;
        setCarrito([...carrito]);
        setFormData({});
        setOpenFormCantidad(false);
        setSuccessMsg(` + ${formData.producto?.nombre} ${formData.cantidad} uds`);
        return;
      }
    } 

    setCarrito(prev => [
      ...prev,
      {
        productoId: formData.productoId,
        cantidad: Number(formData.cantidad),
        precioUnidad: Number(parseFloat(formData.precioUnidad) || 0),
        producto: formData.producto,
        expiracion: formData.expiracion,
        compraId: "",
      }
    ]);
    setSuccessMsg(`${formData.producto?.nombre} ${formData.cantidad} uds`);
    setFormData({});
    setOpenFormCantidad(false);
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--background)" }}>
      <AppHeader titulo="PEDIDO A PROVEEDOR" icon={<ShoppingCartIcon />} usuario={usuarioCompleto} onLogout={handleLogout} />

      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          {proveedor && (
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700, mb: 2 }}>
                {proveedor?.nombre}
              </Typography>
              <Grid container spacing={2}>
                  <Typography variant="body2" sx={{ color: "var(--text-secondary)", mb: 0.5 }}>
                    <strong>Correo:</strong> {proveedor?.correo || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "var(--text-secondary)", mb: 0.5 }}>
                    <strong>Teléfono:</strong> {proveedor?.telefono || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "var(--text-secondary)", mb: 0.5 }}>
                    <strong>Horario entrega:</strong> {proveedor?.horarioEntrega || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
                    <strong>Descripción:</strong> {proveedor?.descripcion || "N/A"}
                  </Typography>
              </Grid>
            </Paper>
          )}

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid #e0e0e0" }}>
            <Tab label={`Historial de compras (${detallesFiltrados.length})`} />
            <Tab label={`Catálogo (${productosFiltrados.length})`} />
          </Tabs>

          <Button variant="contained" startIcon={<ShoppingCartIcon />} onClick={() => setOpenCarrito(true)} sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }} >
            Carrito de Compra
          </Button>

          {tab === 0 && (
            <Stack spacing={2}>
              <TextField placeholder="Buscar por fecha o producto..." value={search} onChange={(e) => setSearch(e.target.value)} fullWidth size="small"/>

              {comprasFiltradas.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                  <Typography color="textSecondary">No hay historial de compras</Typography>
                </Paper>
              ) : (
                  comprasFiltradas.map((compra) => (
                    <TicketCompraCard compra={compra} repeatCompra={() => {  setDetallesPendientes(compra.detalles);}}/>
                  ))
              )}
            </Stack>
          )}

          {tab === 1 && (
            
            <Stack spacing={3}>
              <TextField
                placeholder="Buscar productos..."
                value={searchProducto}
                onChange={(e) => setSearchProducto(e.target.value)}
                fullWidth
                size="small"
              />
              
              <Grid container spacing={2}>
              {productosFiltrados.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center"  }}>
                  <Typography color="textSecondary">No hay productos en el catálogo</Typography>
                </Paper>
              ) : (productosFiltrados.map((producto) => (
                  <StockCard
                    isJefe={usuarioCompleto.rol === "JEFE"}
                    producto={producto}
                    isVenta={true}
                    onSale={() => {agregarProducto(producto)}}
                  />
              )))}
            </Grid>
            </Stack>
          )}

            
      <Dialog open={openCarrito} onClose={() => setOpenCarrito(false)} maxWidth="md" fullWidth PaperProps={{ sx: { maxHeight: "90vh" } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.2rem" }}>Carrito de Compra</DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            {carrito.length === 0 ? (
              <Typography color="textSecondary" sx={{ textAlign: "center", py: 3 }}>
                El carrito está vacío
              </Typography>
            ) : (
              carrito.map((detalle) => (
                <Paper key={detalle.productoId} sx={{ p: 3, borderRadius: 2 }}>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Stack spacing={1} sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {detalle.producto?.nombre}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
                          {detalle.producto?.descripcion}
                        </Typography>
                        {detalle.expiracion && (
                          <Typography variant="body2" sx={{ color: "error.main" }}>
                            <strong>F.Cad:</strong> {new Date(detalle.expiracion).toLocaleDateString("es-ES")}
                          </Typography>
                        )}
                      </Stack>
                      <Stack spacing={2} sx={{ alignItems: "flex-end", minWidth: "200px" }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#667eea", fontSize: "1.1rem" }}>
                          {(detalle.precioUnidad * detalle.cantidad).toFixed(2)}€
                        </Typography>
                        <Stack direction="row" spacing={5} sx={{ width: "100%", justifyContent: "space-Between" }}>
                        
                          <Stack spacing={0.5} sx={{ width: "100%" }}>
                            <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                              <strong>P. Unitario:</strong>
                            </Typography>
                            <TextField
                              value={detalle.precioUnidad}
                              onChange={(e) => {
                                detalle.precioUnidad = parseFloat(e.target.value) || 0;
                                setCarrito([...carrito]);
                              }}
                              size="small"
                              type="number"
                              inputMode="decimal"
                              sx={{ width: "100%", "& input": { textAlign: "right" } }}
                              InputProps={{
                                endAdornment: "€",
                              }}
                            />
                          </Stack>

                          <Stack spacing={0.5} sx={{ width: "100%" }}>
                            <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                              <strong>Cantidad:</strong>
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                  detalle.cantidad = Math.max(0, detalle.cantidad - 1);
                                  if (detalle.cantidad === 0) {
                                    carrito.splice(carrito.findIndex((d) => d.productoId === detalle.productoId), 1);
                                  }
                                  setCarrito([...carrito]);
                                }}
                                sx={{ minWidth: "40px" }}
                              >
                                −
                              </Button>
                              <TextField
                                value={detalle.cantidad}
                                onChange={(e) => {
                                  detalle.cantidad = parseInt(e.target.value) || 0;
                                  if (detalle.cantidad === 0) {
                                    carrito.splice(carrito.findIndex((d) => d.productoId === detalle.productoId), 1);
                                  }
                                  setCarrito([...carrito]);
                                }}
                                size="small"
                                type="number"
                                sx={{ flex: 1, "& input": { textAlign: "center" } }}
                              />
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                  detalle.cantidad = detalle.cantidad + 1;
                                  setCarrito([...carrito]);
                                }}
                                sx={{ minWidth: "40px" }}
                              >
                                +
                              </Button>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </Paper>
              ))
            )}

            <Divider />

            <Paper sx={{ p: 2, backgroundColor: "#f5f7fa", borderRadius: 2 }}>
              <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  TOTAL:
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#667eea" }}>
                  {CalcularTotalCarrito().toFixed(2)}€
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCarrito(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmitCompra} disabled={carrito.length === 0} sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            Finalizar Compra
          </Button>
        </DialogActions>
      </Dialog>

      <AgregarAlCarrito open={openFormCantidad} onClose={() => setOpenFormCantidad(false)} onAgregar={agregarAlCarrito} formData={formData} setFormData={setFormData} />
        </Stack>
      </Box>

      <AppSnackbars successMsg={successMsg} errorMsg={errorMsg} setSuccessMsg={setSuccessMsg} setErrorMsg={setErrorMsg} />
    </Box>
  );
}