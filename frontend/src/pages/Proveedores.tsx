import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Collapse,
  Stack,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { api } from "../api/axios";

interface Proveedor {
  id?: string;
  nombre: string;
  correo? : string;
  telefono?: string;
  horarioEntrega?: string;
  descripcion?: string;
}

function decodeToken(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function ProveedoresPage() {

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
    const [search, setSearch] = useState("");
  
    const [openForm, setOpenForm] = useState(false);
    const [editingProveedor, setEditingProveedor] =
      useState<Proveedor | null>(null);
  
    const [formData, setFormData] = useState<any>({});
    const [successMsg, setSuccessMsg] = useState("");
  
    const token = localStorage.getItem("accessToken");
    const user = token ? decodeToken(token) : null;
  
  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async() => {
    const res = await api.get("/proveedor");
    setProveedores(res.data);
  };

  const handleEdit = (prov: Proveedor) => {
    setEditingProveedor(prov);
    setFormData({prov});
    setOpenForm(true);
  }

  const handleCreate = () => {
    setEditingProveedor(null);
    setFormData({});
    setOpenForm(true); 
  }

  const handleSubmit = async() => {
    const payload = {
      nombre: formData.nombre,
      correo: formData.correo,
      telefono: formData.telefono,
      horarioEntrega: formData.horarioEntrega,
      descripcion: formData.descripcion
    }

    if (editingProveedor) {
      await api.patch(`/proveedor/${editingProveedor.id}`, payload);
      setSuccessMsg("Proveedor actualizado correctamente");
    }

    else {
      await api.post("/proveedor", payload);
      setSuccessMsg("Proveedor creado correctamente");
    }

    setOpenForm(false);
    fetchProveedores();

  }

  const proveedoresFiltrados = proveedores.filter((prov) => {
    const texto = search.toLowerCase();

    return (
      prov.nombre.toLowerCase().includes(texto) ||
      prov.correo?.toLowerCase().includes(texto) ||
      prov.telefono?.toLowerCase().includes(texto) ||
      prov.descripcion?.toLowerCase().includes(texto)
    );
  })

  return (
    <Box p={5}>
      <Typography variant="h4" mb={4} fontWeight={600}>
        Gestion de Proveedores
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4, alignItems: "center" }}>
        <TextField
          label="Buscar proveedor"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {user?.rol === "JEFE" && (
          <Button variant="contained" onClick={handleCreate}>
            Crear proveedor
          </Button>
        )}
      </Stack>

      <Stack spacing={3}>
        {proveedoresFiltrados.map((prov) => (
          <Paper key={prov.id} sx={{ p: 3, borderRadius: 3 }}>  
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box>
                <Typography fontWeight={600}>{prov.nombre}</Typography>
                <Typography variant="body2">{prov.correo}</Typography>
                <Typography variant="body2">{prov.telefono}</Typography>
                <Typography variant="body2">{prov.descripcion}</Typography>
                <Typography variant="body2">{prov.horarioEntrega}</Typography>
                {user?.rol === "RRHH" && (
                  <>
                    <Button variant="outlined" onClick={() => handleEdit(prov)}> Editar </Button>
                  </>
               )}
              </Box>
            </Stack>
          </Paper>
        ))}
      </Stack>
      
      {/* FORMULARIO */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingProveedor
            ? "Editar proveedor"
            : "Crear proveedor"}
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
              label="Correo"
              value={formData.correo || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  correo: e.target.value,
                })
              }
            />
            <TextField
              label="Telefono"
              value={formData.telefono || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  telefono: e.target.value,
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
              label="Horario Entrega"
              value={formData.horarioEntrega || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  horarioEntrega: e.target.value,
                })
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
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