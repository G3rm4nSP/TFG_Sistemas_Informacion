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

interface CompraDetalle {
  compraId: string;
  productoId: string;
  cantidad: number;
  precioUnidad: number;
  producto?: Producto;
}

interface Compra {
  id: string;
  proveedorId: string;
  localId: string;
  fecha: string;
  total: number;
  detalles: CompraDetalle[];
}

function decodeToken(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function PedidoProveedor() {
  const { provId } = useParams();

  const [proveedor, setProveedor] = useState<any>(null);
  const [usuarioCompleto, setUsuarioCompleto] = useState<any>(null);
  const [historicoCompras, setHistoricoCompras] = useState<Compra[]>([]);
  const [search, setSearch] = useState("");
  const [searchProducto, setSearchProducto] = useState("");
  const [carrito, setCarrito] = useState<CompraDetalle[]>([]);
  const [openCarrito, setOpenCarrito] = useState(false);
  const [openCatalogo, setOpenCatalogo] = useState(false);
  const [openFormProducto, setOpenFormProducto] = useState(false);
  const [openFormCantidad, setOpenFormCantidad] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [catalogoProductos, setCatalogoProductos] = useState<Producto[]>([]);
  const [formData, setFormData] = useState<any>({});

  const token = localStorage.getItem("accessToken");
  const user = token ? decodeToken(token) : null;

 
  useEffect(() => {
    fetchProveedor();
    fetchUsuario();
  }, []);

  useEffect(() => {
    if (proveedor?.id && usuarioCompleto?.empleado?.localId) {
      fetchHistoricoCompras();
    }
  }, [proveedor, usuarioCompleto]);

  const fetchProveedor = async () => {
    const prov = await api.get(`/proveedor/${provId}`);
    setProveedor(prov.data);
  };

  const fetchUsuario = async () => {
    const usr = await api.get(`/usuario/${user.sub}`);
    setUsuarioCompleto(usr.data);
  };

  const fetchHistoricoCompras = async () => {
    const compras = await api.get("/compra", {
      params: {
        proveedorId: proveedor.id,
        localId: usuarioCompleto.empleado.localId,
      },
    });
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
      }))
    );
  }, [historicoCompras]);

  const abrirCatalogo = () => {
    fetchCatalogoProductos();
    setOpenCatalogo(true);
  };

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


  const CalcularTotalCarrito = () => {
    return carrito.reduce((total, detalle) => total + detalle.precioUnidad * detalle.cantidad, 0);
  };

  const agregarProducto = (producto: Producto) => {  
    formData.cantidad = 1;
    formData.nombre = producto.nombre;

    setFormData({
      ...formData,
      productoId: producto.id,
      producto: producto,
    });
    setOpenFormCantidad(true);
  }

  const agregarDetalle = (detalle: CompraDetalle) => {
    formData.cantidad = detalle.cantidad;
    formData.precioUnidad = detalle.precioUnidad;
    formData.nombre = detalle.producto?.nombre;
    setFormData({
      ...formData,
      productoId: detalle.productoId,
      producto: detalle.producto,
    });
    setOpenFormCantidad(true);
  }

  const agregarAlCarrito = () => {

    for (let item of carrito) {
      if (item.productoId === formData.productoId) {
        item.cantidad = item.cantidad + formData.cantidad;
        item.precioUnidad = parseFloat(formData.precioUnidad) || 0;
        setCarrito([...carrito]);
        setFormData({});
        setOpenFormCantidad(false);
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
        compraId: "",
      }
    ]);
    setFormData({});
    setOpenFormCantidad(false);
  }

  return (
    <Box p={5}>
      {proveedor && (
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" mb={2}>
            Pedido a {proveedor?.nombre}
          </Typography>
          <Typography>Correo: {proveedor?.correo}</Typography>
          <Typography>Teléfono: {proveedor?.telefono}</Typography>
          <Typography>Horario entrega: {proveedor?.horarioEntrega}</Typography>
          <Typography>Descripción: {proveedor?.descripcion}</Typography>
        </Paper>
      )}

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" mb={4} fontWeight={600}>
          Historial de productos comprados
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <TextField
            label="Buscar por fecha o producto"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="contained" color="success" onClick={() => setOpenCarrito(true)}> Carrito Compra </Button> 
          <Button variant="contained" color="warning" onClick={() => abrirCatalogo()}> Catalogo Productos </Button>
        </Stack>

        <Stack spacing={3}>
          {detallesFiltrados.map((detalle) => (
            <Paper key={`${detalle.compraId}-${detalle.productoId}`} sx={{ p: 3, borderRadius: 3 }}>
              <Typography fontWeight={600}>
                {new Date(detalle.fecha).toLocaleDateString()}
              </Typography>

              <Box sx={{ ml: 2, mt: 1 }}>
                <Typography variant="body2">
                  Producto: {detalle.producto?.nombre}
                </Typography>
                <Typography variant="body2">
                  Cantidad: {detalle.cantidad}
                </Typography>
                <Typography variant="body2">
                  Precio unidad: {detalle.precioUnidad}€
                </Typography>
                <Typography variant="body2">
                  Precio lote: {detalle.precioUnidad * detalle.cantidad}€
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Button variant="contained" color="primary"
                onClick={() => {agregarDetalle(detalle);}}>
                Volver a comprar
              </Button>
            </Paper>
          ))}
        </Stack>

        <Divider sx={{ my: 4 }} />

        
      </Paper>

            
      {/* Carrito Compra */}
      <Dialog
        open={openCarrito}
        onClose={() => setOpenCarrito(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Carrito de Compra
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            {carrito.map((detalle)=> (
              <Paper key = {detalle.productoId} sx={{ p: 3, borderRadius: 3 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                  <Stack spacing={2} mt={1}>
                    <Typography fontWeight={600}>{detalle.producto?.nombre}</Typography>
                    <Typography variant="body2">Descripcion: {detalle.producto?.descripcion}</Typography>
                    <Typography variant="body2">Precio Unidad: {(detalle.precioUnidad).toFixed(2)} €</Typography>
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
                      <TextField value={ detalle.cantidad} onChange={(e) => {
                        detalle.cantidad = parseInt(e.target.value) || 0;
                        if (detalle.cantidad === 0) {
                          carrito.splice(carrito.findIndex(d => d.productoId === detalle.productoId), 1);
                        }
                        setCarrito([...carrito]);
                      }} />
                      <Button variant="contained" color="success" onClick={() => {
                        detalle.cantidad = detalle.cantidad + 1;
                        setCarrito([...carrito]);
                      }}> + </Button>
                    </Stack>
                    <Typography variant="body2">Precio Total: {(detalle.precioUnidad * detalle.cantidad).toFixed(2)} €</Typography>
                  </Stack>
                </Stack>
              </Paper>
            ))}
            <Typography variant="h6">
              Total carrito: {CalcularTotalCarrito().toFixed(2)} €
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenCarrito(false)}>
            Seguir comprando
          </Button>
          <Button variant="contained" onClick={handleSubmitCompra}>
            Comprar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Catálogo Productos */}
      <Dialog
        open={openCatalogo}
        onClose={() => setOpenCatalogo(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Catálogo de Productos
        </DialogTitle>

        <DialogContent>
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
                  
                  <Button variant="contained" color="success" onClick={() => agregarProducto(producto)}> Comprar a Proveedor </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenCatalogo(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => {
            setOpenCarrito(true);
            setOpenCatalogo(false);
          }}>
            Comprar
          </Button>
        </DialogActions>
      </Dialog>

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


      {/* Formulario Añadir a la cesta */}
      <Dialog
        open={openFormCantidad}
        onClose={() => setOpenFormCantidad(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          CANTIDAD - {formData.nombre}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="CANTIDAD"
              value={formData.cantidad || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cantidad: parseInt(e.target.value) || 0,
                })
              }
            />
            <TextField
              label="Precio por unidad"
              value={formData.precioUnidad ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  precioUnidad: e.target.value,
                })
              }
              type="text"
              inputMode="decimal"
            />
            <Typography variant="body2">Precio Total: {parseFloat(formData.precioUnidad || "0") * parseFloat(formData.cantidad || "0")} €</Typography>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenFormCantidad(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick= {() => {
            
              agregarAlCarrito();
            
            
          }}>
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