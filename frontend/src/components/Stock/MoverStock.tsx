import { useState ,useEffect} from "react";

import {  Dialog,  DialogTitle,  DialogContent,  DialogActions,  Button,  Stack,  TextField,  Typography,  Card,  CardContent,  Box,  FormControl,  InputLabel,  Select,  MenuItem,} from "@mui/material";
import AppSnackbars from "../generals/AppSnackbars";
import { api } from "../../api/axios";
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

type Props = {
  prodMovido: any;
  prodOrigen: string;
  open: boolean;
  onClose: () => void;
  fetchStock: () => void;
  ubisAMover: any[];
};

export default function MoverStock({
  prodMovido,
  prodOrigen,
  open,
  onClose,
  fetchStock,
  ubisAMover,
}: Props) {
    const [openListaUbicaciones, setOpenListaUbicaciones] = useState(false);
    const [openFormNuevaUbicacion, setOpenFormNuevaUbicacion] = useState(false);
    const [searchUbicacion, setSearchUbicacion] = useState("");
    const [formDataUbi, setFormDataUbi] = useState<any>({});    
    const [movido, setMovido] = useState<any>(null);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [origenId, setOrigenId] = useState("");
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    
    async function inicio() {
      await setMovido(prodMovido);
      await setOrigenId(prodOrigen);
      fetchUbicaciones();
      console.log("Movido:", movido);
    }

    useEffect( () => {
      inicio();
    }, [prodMovido, prodOrigen]);

    const ubicacionesFiltradas = ubicaciones.filter((ubicacion) =>{
    const texto = searchUbicacion.toLowerCase();

    return (
      ubicacion.local.nombre.toLowerCase().includes(texto) ||
      ubicacion.tipo.toLowerCase().includes(texto) ||
      ubicacion.descripcion.toLowerCase().includes(texto)
    );
  });

    const fetchUbicaciones = async () => {
      const ubis = await api.get("/ubicacion");
      setUbicaciones(ubis.data);
    };
    
    const handleSubmitUbicacion = async () => {
      const payloadUbi = {
        localId : formDataUbi.localId,
        tipo : formDataUbi.tipo,
        descripcion : formDataUbi.descripcion,
      }
      const ubi = await api.post ("/ubicacion", payloadUbi);
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

    const handleMoveStock = async (ubicacionId : String) => {
        let payload = {};
      try {
        payload = {
          productoId: movido.productoId,
          destinoUbicacionId: ubicacionId,
          cantidad: movido.cantidad,
          valor: (movido.valor/movido.cantidadTotal)*movido.cantidad,
        };
        await api.patch(`/stock/mover/${origenId}`, payload);
        setSuccessMsg("Producto movido correctamente")
      } catch (error) {
        console.error("Error moviendo stock:", error);
        setErrorMsg("Error al mover el stock. Inténtalo de nuevo.");
      }
      onClose();
      setOpenListaUbicaciones(false);
      fetchStock();
      setMovido(undefined);
      setOrigenId("");
    };

    return (
      <>    
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Mover {movido?.nombre}</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
                <Typography>Cantidad a mover</Typography>
                <Stack direction="row" spacing={1} alignItems="center">        
                 
                <Button size="small" onClick={() => setMovido({ ...movido, cantidad: Math.max(1, movido.cantidad - 1) })}>
                    −
                </Button>
                <TextField type="number" value={movido?.cantidad ?? 1} onChange={(e) => setMovido({ ...movido, cantidad:Math.min(parseInt(e.target.value) || 1, movido.cantidadTotal)})} sx={{ width: 80 }} />
                <Button size="small" onClick={() => setMovido({ ...movido, cantidad: Math.min(movido.cantidad + 1, movido.cantidadTotal) })}>
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
            <Button onClick={onClose}>Cancelar</Button>
            <Button onClick={() => {setOpenListaUbicaciones(true); onClose(); }}>Nueva Ubicación</Button>
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
        <AppSnackbars
          successMsg={successMsg}
          errorMsg={errorMsg}
          setSuccessMsg={setSuccessMsg}
          setErrorMsg={setErrorMsg}
        />
      </>
      
    );
  };
