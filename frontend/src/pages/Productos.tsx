import { useEffect, useState } from "react";
import { Box, Typography, Button, Stack, TextField, Grid, Tabs, Tab, useTheme, useMediaQuery } from "@mui/material";
import { api } from "../api/axios";
import { fetchUsuario, logout } from "../services/userService";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/generals/AppHeader";
import StockCard from "../components/Stock/StockCard";
import StorageIcon from "@mui/icons-material/Storage";
import AddIcon from "@mui/icons-material/Add";
import AppSnackbars from "../components/generals/AppSnackbars";
import {CrearEditarProducto, AplicarDescuento} from "../components/Stock/CrearEditarProducto";
import MoverStock from "../components/Stock/MoverStock";

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

export default function ProductosPage() {
  const [usuarioCompleto, setUsuarioCompleto] = useState<any>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchProducto, setSearchProducto] = useState("");
  const [openDescuento, setOpenDescuento] = useState (false);
  const [openFormProducto, setOpenFormProducto] = useState(false);
  const [openFormMoverStock, setOpenFormMoverStock] = useState(false);
  const [catalogoProductos, setCatalogoProductos] = useState<Producto[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState<any>({});
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [movido, setMovido] = useState<any>();
  const [origenId, setOrigenId] = useState("");
  const [ubisAMover, setUbisAMover] = useState<Stock[]>([]);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [tab, setTab] = useState(0);

  const navigate = useNavigate();
 
  useEffect(() => {
    
    fetchCatalogoProductos();
    fetchStock();
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

  const fetchCatalogoProductos = async () => {
    const productos = await api.get("/producto");
    setCatalogoProductos(productos.data);
  };


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



  const moverStock = async (stock : Stock) =>{
    setOrigenId(stock.id),
    setUbisAMover(stocks.filter(s => s.producto.id === stock.producto.id && s.ubicacion.tipo !== stock.ubicacion.tipo),
  ) 
    await setMovido({
      cantidadTotal : stock.cantidad,
      cantidad: 1,
      productoId: stock.producto.id,
      nombre: stock.producto.nombre,
      valor: stock.valor,
      destinoUbicacionId: ""
    })
    
    setOpenFormMoverStock(true);
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

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--background)" }}>
      <AppHeader titulo="VISTA STOCK" icon={<StorageIcon />} usuario={usuarioCompleto} onLogout={handleLogout} />
      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700 }}>
              Stock
            </Typography>
            {usuarioCompleto?.rol === "JEFE" && (
              <Button variant="contained" disabled={usuarioCompleto?.rol !== "JEFE"} startIcon={<AddIcon />} onClick={() => { setEditingProducto(null); setFormData({}); setOpenFormProducto(true); }}>
                Nuevo Producto
              </Button>
            )}
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
                  <StockCard
                    isJefe={usuarioCompleto.rol === "JEFE"}
                    stock={stock}
                    onMove={() => moverStock(stock)}
                    onDiscount={() => { setFormData({ ...formData, idDescuento: stock.id }); setOpenDescuento(true); }}
                    onDelete={() => handleDeleteStock(stock.id)}
                  />
              ))}
            </Grid>
          )}

          {tab === 1 && (
            <Grid container spacing={2}>
              {almacenFiltrado.map((stock) => (
                  <StockCard
                    isJefe={usuarioCompleto.rol === "JEFE"}
                    stock={stock}
                    onMove={() => moverStock(stock)}
                    onDiscount={() => { setFormData({ ...formData, idDescuento: stock.id }); setOpenDescuento(true); }}
                    onDelete={() => handleDeleteStock(stock.id)}
                    isStock = {true}
                  />
              ))}
            </Grid>
          )}
          {tab === 2 && (
            <Grid container spacing={2}>
              {productosFiltrados.map((producto) => (
                  <StockCard
                    isJefe={usuarioCompleto.rol === "JEFE"}
                    producto={producto}
                    isCatalogo={true}
                    onEdit={() => {
                      setEditingProducto(producto);
                      setFormData(producto);
                      setOpenFormProducto(true);
                    }}
                  />
              ))}
            </Grid>
          )}
        </Stack>
      </Box>

      <CrearEditarProducto open={openFormProducto} onClose={() => setOpenFormProducto(false)} isEdit={!!editingProducto}
       fetchCatalogoProductos={fetchCatalogoProductos} fetchStock={fetchStock} editingProducto={editingProducto} />
      <AplicarDescuento open={openDescuento} onClose={() => setOpenDescuento(false)} fetchStock={fetchStock} />
          
      <MoverStock prodMovido={movido} prodOrigen={origenId} open={openFormMoverStock} onClose={() => setOpenFormMoverStock(false)} fetchStock={fetchStock} ubisAMover={ubisAMover} />    

      <AppSnackbars successMsg={successMsg} errorMsg={errorMsg} setSuccessMsg={setSuccessMsg} setErrorMsg={setErrorMsg}/>  
    </Box>
  );
}
