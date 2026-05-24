import { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, AppBar, Toolbar, Grid, Tabs, Tab, Card, CardContent, Chip, Divider, useTheme, useMediaQuery, Collapse, IconButton } from "@mui/material";
import { api } from "../api/axios";
import { decodeToken, removeAuthToken } from "../auth";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import StorageIcon from "@mui/icons-material/Storage";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface Stock {
  id: string;
  stockId: string;
  ubicacionId: string;
  cantidad: number;
  descuento: number;
  updatedAt: Date;
  producto: Producto;
  ubicacion: Ubicacion;
  valor: number;
}

type Ubi = "ALMACEN" | "TIENDA";

interface Ubicacion {
  id: string;
  localId: string;
  tipo: Ubi;
  descripcion: string;
  local: { nombre: string };
}

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
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
  stocks: { cantidad: number }[];
}

export default function ProductosPage() {
  const [searchProducto, setSearchProducto] = useState("");
  const [searchUbicacion, setSearchUbicacion] = useState("");
  const [openFormProducto, setOpenFormProducto] = useState(false);
  const [openFormMoverStock, setOpenFormMoverStock] = useState(false);
  const [openListaUbicaciones, setOpenListaUbicaciones] = useState(false);
  const [openFormNuevaUbicacion, setOpenFormNuevaUbicacion] = useState(false);
  const [openDescuento, setOpenDescuento] = useState(false);
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
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [tab, setTab] = useState(0);
  const [expandedStocks, setExpandedStocks] = useState<{ [key: string]: boolean }>({});

  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const user = token ? decodeToken(token) : null;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
  };

  const stocksAlmacen = stocks.filter((stock) => stock.ubicacion.tipo === "ALMACEN");
  const stocksTienda = stocks.filter((stock) => stock.ubicacion.tipo === "TIENDA");

  const tiendaFiltrada = stocksTienda.filter((stock) =>
    [stock.producto.nombre, stock.producto.tipo, stock.producto.descripcion, stock.producto.id].some((f) =>
      f?.toLowerCase().includes(searchProducto.toLowerCase())
    )
  );

  const almacenFiltrado = stocksAlmacen.filter((stock) =>
    [stock.producto.nombre, stock.producto.tipo, stock.producto.descripcion, stock.producto.id].some((f) =>
      f?.toLowerCase().includes(searchProducto.toLowerCase())
    )
  );

  const productosFiltrados = catalogoProductos.filter((producto) =>
    [producto.nombre, producto.descripcion].some((f) =>
      f?.toLowerCase().includes(searchProducto.toLowerCase())
    )
  );

  const ubicacionesFiltradas = ubicaciones.filter((ubicacion) =>
    [ubicacion.local.nombre, ubicacion.tipo, ubicacion.descripcion].some((f) =>
      f?.toLowerCase().includes(searchUbicacion.toLowerCase())
    )
  );

  const handleLogout = () => {
    removeAuthToken();
    navigate("/login");
  };

  const handleEditProducto = async () => {
    const payload = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      tipo: formData.tipo,
      porcentajeIVA: parseFloat(formData.porcentajeIVA),
      precioBase: parseFloat(formData.precioBase),
      expiracion: formData.expiracion || null,
    };
    await api.patch(`/producto/${editingProducto?.id}`, payload);
    setSuccessMsg("Producto actualizado correctamente");
    setOpenFormProducto(false);
    fetchCatalogoProductos();
    fetchStock();
    setFormData({});
  };

  const handleCreateProducto = async () => {
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
  };

  const moverStock = (stock: Stock) => {
    setOrigenId(stock.id);
    setUbisAMover(stocks.filter((s) => s.producto.id === stock.producto.id && s.ubicacion.tipo !== stock.ubicacion.tipo));
    setMovido({
      cantidadTotal: stock.cantidad,
      cantidad: 1,
      productoId: stock.producto.id,
      nombre: stock.producto.nombre,
      valor: stock.valor,
      destinoUbicacionId: "",
    });
    setOpenFormMoverStock(true);
  };

  const handleMoveStock = async (ubicacionId: String) => {
    try {
      const payload = {
        productoId: movido.productoId,
        destinoUbicacionId: ubicacionId,
        cantidad: movido.cantidad,
        valor: (movido.valor / movido.cantidadTotal) * movido.cantidad,
      };
      await api.patch(`/stock/mover/${origenId}`, payload);
      setSuccessMsg("Producto movido correctamente");
    } catch (error) {
      setErrorMsg("Error al mover el stock. Inténtalo de nuevo.");
    }
    setOpenFormMoverStock(false);
    setOpenListaUbicaciones(false);
    fetchStock();
    setMovido(undefined);
    setOrigenId("");
  };

  const handleDeleteStock = async (id: String) => {
    try {
      await api.delete(`/stock/${id}`);
      setSuccessMsg("Producto eliminado correctamente");
      fetchStock();
    } catch (error) {
      setErrorMsg("Error al eliminar el stock. Inténtalo de nuevo.");
    }
  };

  const handleDescuentoStock = async () => {
    const payload = { descuento: parseFloat(formData.descuento) };
    try {
      await api.patch(`/stock/${formData.idDescuento}`, payload);
      setSuccessMsg("Descuento aplicado correctamente");
      fetchStock();
    } catch (error) {
      setErrorMsg("Error al aplicar el descuento. Inténtalo de nuevo.");
    }
    setOpenDescuento(false);
  };

  const handleSubmitUbicacion = async () => {
    const payloadUbi = { localId: formDataUbi.localId, tipo: formDataUbi.tipo, descripcion: formDataUbi.descripcion };
    const ubi = await api.post("/ubicacion", payloadUbi);
    setSuccessMsg("Ubicacion creada correctamente");
    handleMoveStock(ubi.data.id);
    setOpenFormNuevaUbicacion(false);
    setOpenListaUbicaciones(false);
    fetchStock();
    fetchUbicaciones();
    setFormDataUbi({});
    setMovido(undefined);
    setOrigenId("");
  };

  const StockCard = ({ stock, onMove, onDiscount, onDelete }: any) => (
    <Card sx={{ borderLeft: "4px solid #667eea" }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#667eea", mb: 1 }}>
          {stock.producto.nombre}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          {stock.producto.descripcion}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <Chip label={`${stock.cantidad} uds`} size="small" variant="outlined" />
          {stock.descuento > 0 && <Chip label={`${stock.descuento}%`} size="small" color="error" />}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap" }}>
          <Typography variant="caption" sx={{ backgroundColor: "#f0f0f0", p: "4px 8px", borderRadius: "4px" }}>
            {stock.ubicacion.local.nombre}
          </Typography>
          <Typography variant="caption" sx={{ backgroundColor: "#f0f0f0", p: "4px 8px", borderRadius: "4px" }}>
            {stock.ubicacion.tipo}
          </Typography>
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          <Button size="small" variant="contained" startIcon={<ArrowForwardIcon />} onClick={onMove}>
            Mover
          </Button>
          <Button size="small" variant="outlined" onClick={onDiscount}>
            Descuento
          </Button>
          {stock.cantidad === 0 && (
            <Button size="small" color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={onDelete}>
              Eliminar
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  const CatalogoCard = ({ producto }: any) => (
    <Card sx={{ borderLeft: "4px solid #764ba2" }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#764ba2", mb: 1 }}>
          {producto.nombre}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          {producto.descripcion}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <Chip label={`${producto.precioBase.toFixed(2)}€`} size="small" color="primary" />
          <Chip label={`Stock: ${producto.stocks.reduce((t, s) => t + s.cantidad, 0)}`} size="small" variant="outlined" />
        </Stack>
        {producto.expiracion && <Chip label="Perecedero" size="small" color="warning" sx={{ mb: 1.5 }} />}
        <Button
          size="small"
          variant="contained"
          fullWidth
          startIcon={<EditIcon />}
          onClick={() => {
            setEditingProducto(producto);
            setFormData(producto);
            setOpenFormProducto(true);
          }}
        >
          Editar
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "var(--background)" }}>
      <AppBar position="sticky" sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <StorageIcon />
            Gestión Stock
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button size="small" variant="contained" sx={{ backgroundColor: "rgba(255,255,255,0.2)" }} onClick={() => navigate("/home")}>
              Volver
            </Button>
            <Button size="small" variant="contained" sx={{ backgroundColor: "rgba(255,255,255,0.2)" }} onClick={handleLogout}>
              Salir
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700 }}>
              Stock
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingProducto(null); setFormData({}); setOpenFormProducto(true); }}>
              Nuevo Producto
            </Button>
          </Stack>

          <TextField placeholder="Buscar productos..." value={searchProducto} onChange={(e) => setSearchProducto(e.target.value)} fullWidth size="small" />

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid #e0e0e0" }}>
            <Tab label={`Tienda (${tiendaFiltrada.length})`} />
            <Tab label={`Almacén (${almacenFiltrado.length})`} />
            <Tab label={`Catálogo (${productosFiltrados.length})`} />
          </Tabs>

          {tab === 0 && (
            <Grid container spacing={2}>
              {tiendaFiltrada.map((stock) => (
                <Grid item xs={12} sm={6} md={4} key={stock.id}>
                  <StockCard
                    stock={stock}
                    onMove={() => moverStock(stock)}
                    onDiscount={() => { setFormData({ ...formData, idDescuento: stock.id }); setOpenDescuento(true); }}
                    onDelete={() => handleDeleteStock(stock.id)}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {tab === 1 && (
            <Grid container spacing={2}>
              {almacenFiltrado.map((stock) => (
                <Grid item xs={12} sm={6} md={4} key={stock.id}>
                  <StockCard
                    stock={stock}
                    onMove={() => moverStock(stock)}
                    onDiscount={() => { setFormData({ ...formData, idDescuento: stock.id }); setOpenDescuento(true); }}
                    onDelete={() => handleDeleteStock(stock.id)}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {tab === 2 && (
            <Grid container spacing={2}>
              {productosFiltrados.map((producto) => (
                <Grid item xs={12} sm={6} md={4} key={producto.id}>
                  <CatalogoCard producto={producto} />
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </Box>

      <Dialog open={openFormProducto} onClose={() => setOpenFormProducto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProducto ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField label="Nombre" fullWidth value={formData.nombre || ""} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
            <TextField label="Descripción" fullWidth value={formData.descripcion || ""} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} />
            <TextField label="Tipo" fullWidth value={formData.tipo || ""} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} />
            <TextField label="Porcentaje IVA" type="number" fullWidth value={formData.porcentajeIVA || ""} onChange={(e) => setFormData({ ...formData, porcentajeIVA: e.target.value })} />
            <TextField label="Precio Base" type="number" fullWidth value={formData.precioBase || ""} onChange={(e) => setFormData({ ...formData, precioBase: e.target.value })} />
            <Button variant={formData.expiracion ? "contained" : "outlined"} onClick={() => setFormData({ ...formData, expiracion: formData.expiracion ? null : new Date() })}>
              {formData.expiracion ? "Con fecha de expiración" : "Sin fecha de expiración"}
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFormProducto(false)}>Cancelar</Button>
          <Button variant="contained" onClick={editingProducto ? handleEditProducto : handleCreateProducto}>
            {editingProducto ? "Editar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openFormMoverStock} onClose={() => setOpenFormMoverStock(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mover {movido?.nombre}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Typography>Cantidad a mover</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button size="small" onClick={() => setMovido({ ...movido, cantidad: Math.max(1, movido.cantidad - 1) })}>
                −
              </Button>
              <TextField type="number" value={movido?.cantidad ?? 1} onChange={(e) => setMovido({ ...movido, cantidad: parseInt(e.target.value) || 1 })} sx={{ width: 80 }} />
              <Button size="small" onClick={() => setMovido({ ...movido, cantidad: movido.cantidad + 1 })}>
                +
              </Button>
            </Stack>
            <Typography sx={{ mt: 2 }}>Ubicaciones disponibles</Typography>
            <Stack spacing={1}>
              {ubisAMover.map((stock) => (
                <Card key={stock.id}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {stock.ubicacion.descripcion}
                        </Typography>
                        <Typography variant="caption">Cantidad: {stock.cantidad}</Typography>
                      </Box>
                      <Button size="small" variant="contained" onClick={() => handleMoveStock(stock.ubicacionId)}>
                        Mover
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFormMoverStock(false)}>Cancelar</Button>
          <Button onClick={() => { setOpenListaUbicaciones(true); setOpenFormMoverStock(false); }}>Nueva Ubicación</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openListaUbicaciones} onClose={() => setOpenListaUbicaciones(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ubicaciones Disponibles</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField placeholder="Buscar ubicaciones..." value={searchUbicacion} onChange={(e) => setSearchUbicacion(e.target.value)} fullWidth size="small" />
            <Stack spacing={1}>
              {ubicacionesFiltradas.map((ubicacion) => (
                <Card key={ubicacion.id}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {ubicacion.local.nombre}
                        </Typography>
                        <Typography variant="caption">
                          {ubicacion.tipo} - {ubicacion.descripcion}
                        </Typography>
                      </Box>
                      <Button size="small" variant="contained" onClick={() => { setOpenListaUbicaciones(false); handleMoveStock(ubicacion.id); }}>
                        Mover
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenListaUbicaciones(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => { setOpenListaUbicaciones(false); setOpenFormNuevaUbicacion(true); }}>
            Nueva Ubicación
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openFormNuevaUbicacion} onClose={() => setOpenFormNuevaUbicacion(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Ubicación</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField label="Local ID" fullWidth value={formDataUbi.localId || ""} onChange={(e) => setFormDataUbi({ ...formDataUbi, localId: e.target.value })} />
            <TextField label="Descripción" fullWidth value={formDataUbi.descripcion || ""} onChange={(e) => setFormDataUbi({ ...formDataUbi, descripcion: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select label="Tipo" value={formDataUbi.tipo || ""} onChange={(e) => setFormDataUbi({ ...formDataUbi, tipo: e.target.value })}>
                <MenuItem value="ALMACEN">ALMACEN</MenuItem>
                <MenuItem value="TIENDA">TIENDA</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFormNuevaUbicacion(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmitUbicacion}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDescuento} onClose={() => setOpenDescuento(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Aplicar Descuento</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField label="Descuento %" type="number" fullWidth value={formData.descuento || ""} onChange={(e) => setFormData({ ...formData, descuento: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDescuento(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleDescuentoStock}>
            Aplicar
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