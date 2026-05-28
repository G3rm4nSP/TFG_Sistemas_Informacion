import { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, Stack, TextField, AppBar, Toolbar, Grid, useTheme, useMediaQuery } from "@mui/material";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";
import BusinessIcon from "@mui/icons-material/Business";
import AddIcon from "@mui/icons-material/Add";
import { fetchUsuario, logout } from "../services/userService";
import AppSnackbars from "../components/generals/AppSnackbars";
import { CrearEditarProveedor } from "../components/Proveedor/CrearEditarProveedor";
import ProveedorCard from "../components/Proveedor/ProveedorCard";
import AppHeader from "../components/generals/AppHeader";

interface Proveedor {
  id: string;
  nombre: string;
  correo? : string;
  telefono?: string;
  horarioEntrega?: string;
  descripcion?: string;
}

export default function ProveedoresPage() {
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [usuarioCompleto, setUsuarioCompleto] = useState<any>(null);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const cargar = async () => {
              const usuario = await fetchUsuario(navigate);
              setUsuarioCompleto(usuario);
            };
            cargar();
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      const response = await api.get("/proveedor");
      setProveedores(response.data);
    } catch (error) {
      navigate("/login");
    }
  };

  const proveedoresFiltrados = proveedores.filter((proveedor) =>
    [proveedor.nombre, proveedor.correo, proveedor.telefono, proveedor.horarioEntrega, proveedor.descripcion].some((f) =>
      f?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleLogout = () => {
    logout(navigate);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
      try {
        await api.delete(`/proveedor/${id}`);
        setSuccessMsg("Proveedor eliminado correctamente");
        fetchProveedores();
      } catch (error) {
        setErrorMsg("Error al eliminar el proveedor");
      }
    }
  };

  const handlePedido = (proveedor: Proveedor) => {
    navigate(`/proveedores/${proveedor.id}`);
  };


  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--background)" }}>
      <AppHeader titulo="VISTA STOCK" icon={<BusinessIcon />} usuario={usuarioCompleto} onLogout={handleLogout} />
      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700 }}>
              Gestión de Proveedores
            </Typography>
            {usuarioCompleto?.rol === "JEFE" && (
              <Button variant="contained" disabled={usuarioCompleto?.rol !== "JEFE"} startIcon={<AddIcon />} onClick={() =>{setOpenForm(true); setEditingProveedor(null);}}>
                Nuevo Prveedor
              </Button>

            )}
          </Stack>

          <TextField placeholder="Buscar proveedores..." value={search} onChange={(e) => setSearch(e.target.value)} fullWidth size="small" />

          <Grid container spacing={2}>
            {proveedoresFiltrados.map((proveedor) => (
                <ProveedorCard proveedor={proveedor} 
                onDelete={() => handleDelete(proveedor.id)} onEdit={ () => {setOpenForm(true); setEditingProveedor(proveedor);} }  onPedido={() => handlePedido(proveedor)} isRRHH={usuarioCompleto?.rol ==="RRHH"} isJefe={usuarioCompleto?.rol ==="JEFE"}/>
            ))}
          </Grid>

          {proveedoresFiltrados.length === 0 && (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography color="textSecondary">No se encontraron proveedores</Typography>
            </Paper>
          )}
        </Stack>
      </Box>

      <CrearEditarProveedor open={openForm} onClose={() => setOpenForm(false)} isEdit={!!editingProveedor} editingProveedor={editingProveedor} fetchProveedores={fetchProveedores} />

      <AppSnackbars successMsg={successMsg} errorMsg={errorMsg} setSuccessMsg={setSuccessMsg} setErrorMsg={setErrorMsg}/>  

    </Box>
  );
}
