import { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, AppBar, Toolbar, Grid, Card, CardContent, Chip, Divider, useTheme, useMediaQuery } from "@mui/material";
import { api } from "../api/axios";
import { decodeToken, removeAuthToken } from "../auth";
import { useNavigate } from "react-router-dom";
import BusinessIcon from "@mui/icons-material/Business";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

interface Proveedor {
  id: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  nif: string;
  email: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
  nombreEmpresa: string;
  cif: string;
  localId: string;
  local: { nombre: string };
  pedidos: any[];
}

export default function ProveedoresPage() {
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const user = token ? decodeToken(token) : null;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
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
    [proveedor.nombre, proveedor.apellidos, proveedor.nombreEmpresa, proveedor.email, proveedor.telefono].some((f) =>
      f?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleLogout = () => {
    removeAuthToken();
    navigate("/login");
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.nombreEmpresa) {
      setErrorMsg("Nombre y empresa son requeridos");
      return;
    }

    try {
      if (editingProveedor) {
        await api.patch(`/proveedor/${editingProveedor.id}`, formData);
        setSuccessMsg("Proveedor actualizado correctamente");
      } else {
        await api.post("/proveedor", formData);
        setSuccessMsg("Proveedor creado correctamente");
      }
      fetchProveedores();
      setOpenForm(false);
      setFormData({});
      setEditingProveedor(null);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Error al guardar el proveedor");
    }
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

  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor);
    setFormData(proveedor);
    setOpenForm(true);
  };

  const handleOpenFormNew = () => {
    setEditingProveedor(null);
    setFormData({});
    setOpenForm(true);
  };

  const ProveedorCard = ({ proveedor }: any) => (
    <Card sx={{ borderLeft: "4px solid #667eea" }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#667eea", mb: 0.5 }}>
              {proveedor.nombre} {proveedor.apellidos}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, color: "#764ba2" }}>
              {proveedor.nombreEmpresa}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip label={`CIF: ${proveedor.cif}`} size="small" variant="outlined" />
            {proveedor.local && <Chip label={proveedor.local.nombre} size="small" color="primary" />}
          </Stack>

          <Divider />

          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Email:</strong>
              <span>{proveedor.email}</span>
            </Typography>
            <Typography variant="caption" sx={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Teléfono:</strong>
              <span>{proveedor.telefono}</span>
            </Typography>
            {proveedor.nif && (
              <Typography variant="caption" sx={{ display: "flex", justifyContent: "space-between" }}>
                <strong>NIF:</strong>
                <span>{proveedor.nif}</span>
              </Typography>
            )}
          </Stack>

          <Stack spacing={0.5}>
            <Typography variant="caption">
              <strong>{proveedor.direccion}</strong>
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {proveedor.ciudad}, {proveedor.provincia} {proveedor.codigoPostal}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {proveedor.pais}
            </Typography>
          </Stack>

          {proveedor.pedidos && proveedor.pedidos.length > 0 && (
            <Chip label={`${proveedor.pedidos.length} pedidos`} size="small" color="success" />
          )}

          <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
            <Button size="small" variant="contained" startIcon={<EditIcon />} onClick={() => handleEdit(proveedor)}>
              Editar
            </Button>
            <Button size="small" color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={() => handleDelete(proveedor.id)}>
              Eliminar
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "var(--background)" }}>
      <AppBar position="sticky" sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <BusinessIcon />
            Proveedores
          </Typography>
          <Stack direction="row" spacing={1}>
            {!isMobile && (
              <Button size="small" variant="contained" sx={{ backgroundColor: "rgba(255,255,255,0.2)" }} onClick={() => navigate("/home")}>
                Volver
              </Button>
            )}
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
              Gestión de Proveedores
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenFormNew} sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              Nuevo Proveedor
            </Button>
          </Stack>

          <TextField
            placeholder="Buscar por nombre, empresa, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2}>
            {proveedoresFiltrados.map((proveedor) => (
              <Grid item xs={12} sm={6} md={4} key={proveedor.id}>
                <ProveedorCard proveedor={proveedor} />
              </Grid>
            ))}
          </Grid>

          {proveedoresFiltrados.length === 0 && (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography color="textSecondary">No se encontraron proveedores</Typography>
            </Paper>
          )}
        </Stack>
      </Box>

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { maxHeight: "90vh" } }}>
        <DialogTitle>{editingProveedor ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
        <DialogContent sx={{ pt: 2, overflowY: "auto" }}>
          <Stack spacing={2}>
            <TextField label="Nombre" fullWidth value={formData.nombre || ""} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
            <TextField label="Apellidos" fullWidth value={formData.apellidos || ""} onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })} />
            <TextField label="Nombre Empresa" fullWidth value={formData.nombreEmpresa || ""} onChange={(e) => setFormData({ ...formData, nombreEmpresa: e.target.value })} />
            <TextField label="CIF" fullWidth value={formData.cif || ""} onChange={(e) => setFormData({ ...formData, cif: e.target.value })} />
            <TextField label="NIF" fullWidth value={formData.nif || ""} onChange={(e) => setFormData({ ...formData, nif: e.target.value })} />
            <TextField label="Email" type="email" fullWidth value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <TextField label="Teléfono" fullWidth value={formData.telefono || ""} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
            <TextField label="Dirección" fullWidth value={formData.direccion || ""} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} />
            <TextField label="Ciudad" fullWidth value={formData.ciudad || ""} onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })} />
            <TextField label="Provincia" fullWidth value={formData.provincia || ""} onChange={(e) => setFormData({ ...formData, provincia: e.target.value })} />
            <TextField label="Código Postal" fullWidth value={formData.codigoPostal || ""} onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })} />
            <TextField label="País" fullWidth value={formData.pais || ""} onChange={(e) => setFormData({ ...formData, pais: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingProveedor ? "Editar" : "Guardar"}
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