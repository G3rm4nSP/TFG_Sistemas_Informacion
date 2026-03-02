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

interface Empleado {
  id?: string;
  localId: string;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  dni: string;
  direccion: string;
  categoria: string;
  activo?: boolean;
  rrhh?: any;
  local?: any;
  usuario?: any;
}

function decodeToken(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editingEmpleado, setEditingEmpleado] =
    useState<Empleado | null>(null);

  const [formData, setFormData] = useState<any>({});
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("accessToken");
  const user = token ? decodeToken(token) : null;

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const fetchEmpleados = async () => {
    const res = await api.get("/empleado");
    setEmpleados(res.data);
  };

  const toggleActivo = async (emp: Empleado) => {
    await api.patch(`/empleado/${emp.id}`, {
      activo: !emp.activo,
    });

    fetchEmpleados();
  };

  const handleEdit = (emp: Empleado) => {
    setEditingEmpleado(emp);
    setFormData({
      ...emp,
      ...emp.rrhh,
    });
    setOpenForm(true);
  };

  const handleCreate = () => {
    const today = new Date();
    const contrato = today.toISOString().split("T")[0];

    const cobroDate = new Date();
    cobroDate.setDate(today.getDate() + 30);
    const cobro = cobroDate.toISOString().split("T")[0];

    setEditingEmpleado(null);
    setFormData({
      fechaContrato: contrato,
      fechaCobro: cobro,
    });
    setOpenForm(true);
  };

  const handleSubmit = async () => {
    const payload = {
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      correo: formData.correo,
      dni: formData.dni,
      direccion: formData.direccion,
      categoria: formData.categoria,
      localId: formData.localId,
      telefono: formData.telefono || null,
      
      salarioBase: Number(formData.salarioBase),
      irpf: Number(formData.irpf),
      numPagas: Number(formData.numPagas),
      comision: Number(formData.comision),
      fechaCobro: formData.fechaCobro,
      fechaContrato: formData.fechaContrato,
      numeroSeguridadSocial: formData.numeroSeguridadSocial,
      iban: formData.iban,
      
      mail : formData.mail || formData.correo,
      rol : formData.rol || "VENTAS"

    };

    if (editingEmpleado) {
      await api.patch(`/empleado/${editingEmpleado.id}`, payload);
      setSuccessMsg("Empleado actualizado correctamente");
    } else {
      const res = await api.post("/empleado", payload);

      setSuccessMsg(
        `Empleado creado correctamente
         Correo empresa: ${res.data.correoEmpresa}
         Contraseña: ${res.data.claveRandom}`
      );
    }

    setOpenForm(false);
    fetchEmpleados();
  };

  const empleadosFiltrados = empleados.filter((emp) => {
    const texto = search.toLowerCase();

    return (
      emp.nombre.toLowerCase().includes(texto) ||
      emp.apellidos.toLowerCase().includes(texto) ||
      emp.correo.toLowerCase().includes(texto) 
    );
  });

  return (
    <Box p={5}>
      <Typography variant="h4" mb={4} fontWeight={600}>
        Gestión de Empleados
      </Typography>

      
      <Stack direction="row" spacing={2} sx={{ mb: 4, alignItems: "center" }}>
        <TextField
          label="Buscar por nombre, apellidos o correo"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {user?.rol === "RRHH" && (
          <Button variant="contained" onClick={handleCreate}>
            Crear empleado
          </Button>
        )}
      </Stack>

      <Stack spacing={3}>
        {empleadosFiltrados.map((emp) => (

          <Box p = {0}>
            {((user?.rol === "VENTAS" && emp.activo) || user?.rol === "RRHH" || user?.rol === "JEFE"  || user?.rol === "ADMIN") && (
              <Paper key={emp.id} sx={{ p: 3, borderRadius: 3 }}>  
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                >
                  <Box>
                    {(user?.rol === "RRHH" || user?.rol === "JEFE") && (
                      <Chip
                        label={emp.activo ? "Activo" : "Inactivo"}
                        color={emp.activo ? "success" : "error"}
                        sx={{ mr: 2 }}
                      />
                    )}
                  </Box>
                  <Box>
                    <Typography fontWeight={600}>
                      {emp.nombre} {emp.apellidos}
                    </Typography>
                    <Typography variant="body2">{emp.correo}</Typography>
                    <Typography variant="body2">{emp.categoria}</Typography>
                  </Box>

                  <Box>          
                    <Button
                      onClick={() =>
                        setExpandedId(
                          expandedId === emp.id ? null : emp.id!
                        )
                      }
                    >
                      {expandedId === emp.id
                        ? "Mostrar menos"
                        : "Mostrar más"}
                    </Button>
                  </Box>
                </Stack>
              
                <Collapse in={expandedId === emp.id}>
                  <Box mt={3}>
                    <Divider sx={{ mb: 2 }} />
                    
                    {emp.dni && (
                      <Typography>DNI: {emp.dni}</Typography>
                    )}
                    {emp.direccion && (
                      <Typography>Dirección: {emp.direccion}</Typography>
                    )}
                    {emp.localId && (
                      <Typography>Local: {emp.local.nombre}</Typography>
                    )}
                    {emp.localId && (
                      <Typography>Local ID: {emp.localId}</Typography>
                    )}

                    {emp.telefono && (
                      <Typography>Telefono: {emp.telefono}</Typography>
                    )}
                  
                    {emp.rrhh && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography>
                          Salario Base: {emp.rrhh.salarioBase}
                        </Typography>
                        <Typography>IRPF: {emp.rrhh.irpf}</Typography>
                        <Typography>
                          Número Pagas: {emp.rrhh.numPagas}
                        </Typography>
                        <Typography>
                          Comisión: {emp.rrhh.comision}
                        </Typography>
                        <Typography>
                          Fecha Cobro: {emp.rrhh.fechaCobro}
                        </Typography>
                        <Typography>
                          Fecha Contrato: {emp.rrhh.fechaContrato}
                        </Typography>
                        <Typography>
                          Nº Seg Social:{" "}
                          {emp.rrhh.numeroSeguridadSocial}
                        </Typography>
                        <Typography>IBAN: {emp.rrhh.iban}</Typography>
                      </>
                    )}

                    {user?.rol === "RRHH" && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Stack direction="row" spacing={2}>
                          <Button
                            variant="outlined"
                            onClick={() => handleEdit(emp)}
                          >
                            Editar
                          </Button>

                          <Button
                            variant="contained"
                            color={
                              emp.activo ? "error" : "success"
                            }
                            onClick={() => toggleActivo(emp)}
                          >
                            {emp.activo
                              ? "Dar de baja"
                              : "Dar de alta"}
                          </Button>
                        </Stack>
                      </>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            )}
          </Box>
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
          {editingEmpleado
            ? "Editar empleado"
            : "Crear empleado"}
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
              label="Apellidos"
              value={formData.apellidos || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  apellidos: e.target.value,
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
              label="DNI"
              value={formData.dni || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dni: e.target.value,
                })
              }
            />
            <TextField
              label="Dirección"
              value={formData.direccion || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  direccion: e.target.value,
                })
              }
            />
            <TextField
              label="Categoría"
              value={formData.categoria || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  categoria: e.target.value,
                })
              }
            />
            <TextField
              label="Local ID" 
              value={formData.localId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  localId: e.target.value,
                })
              }
            />

            <Divider sx={{ my: 1 }} />

            <TextField
              label="Salario Base"
              type="number"
              value={formData.salarioBase || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  salarioBase: e.target.value,
                })
              }
            />
            <TextField
              label="IRPF"
              type="number"
              value={formData.irpf || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  irpf: e.target.value,
                })
              }
            />
            <TextField
              label="Número Pagas"
              type="number"
              value={formData.numPagas || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  numPagas: e.target.value,
                })
              }
            />
            <TextField
              label="Comisión"
              type="number"
              value={formData.comision || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  comision: e.target.value,
                })
              }
            />
            <TextField
              label="Fecha Cobro"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.fechaCobro || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fechaCobro: e.target.value,
                })
              }
            />

            <TextField
              label="Fecha Contrato"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.fechaContrato || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fechaContrato: e.target.value,
                })
              }
            />
            <TextField
              label="Nº Seguridad Social"
              value={
                formData.numeroSeguridadSocial || ""
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  numeroSeguridadSocial:
                    e.target.value,
                })
              }
            />
            <TextField
              label="IBAN"
              value={formData.iban || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  iban: e.target.value,
                })
              }
            />

            {!editingEmpleado && (
              <TextField
              label="Correo Empresarial"
              value={formData.mail || formData.correo || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mail: e.target.value,
                  })
                }
              />
            )}

            {!editingEmpleado &&(
              <FormControl fullWidth>
              <InputLabel>ROL</InputLabel>
              <Select
                label="ROL"
                value={formData.rol || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rol: e.target.value,
                  })
                }
              >
                <MenuItem value="RRHH">RRHH</MenuItem>
                <MenuItem value="VENTAS">VENTAS</MenuItem>
                <MenuItem value="JEFE">JEFE</MenuItem>
              </Select>
            </FormControl>
            )}
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