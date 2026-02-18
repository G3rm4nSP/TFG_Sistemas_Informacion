import { useEffect, useState } from "react";
import { api } from "../api/axios";
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface Empleado {
  id: string;
  localId :string;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  dni : string;
  direccion : string;
  activo : boolean;
  categoria : string;
}

interface EmpleadoRRHH {
  empleadoId: string;
  salarioBase: number;
  numPagas: number;
  comision: number;
  fechaCobro: Date;
  fechaContrato: Date;
  irpf: string;
  numeroSeguridadSocial: string;
  iban: string;
}

export default function Empleados() {
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [empleadosRRHH, setEmpleadosRRHH] = useState<EmpleadoRRHH[]>([]);
  
  const [localId, setLocalId] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [dni, setDni] = useState("");
  const [direccion, setDireccion] = useState("");
  const [activo, setActivo] = useState(true);
  const [categoria, setCategoria] = useState("");

  const[empleadoId, setEmpleadoId] = useState(localId);
  const[salarioBase, setSalarioBase] = useState("")

  const fetchEmpleados = async () => {
    const res = await api.get("/empleado");
    setEmpleados(res.data);
  };

  const fetchEmpleadosRRHH = async () => {
    const res = await api.get("/empleado-rrhh");
    setEmpleadosRRHH(res.data);
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const addEmpleado = async () => {
    await api.post("/empleado", {
      localId,
      nombre,
      apellidos,
      correo,
      telefono: telefono || null,
      dni,
      direccion,
      activo,
      categoria,
    });

    resetForm();
    fetchEmpleados();
  };

  const editEmpleado = async () => {
    await api.post("/empleado", {
      localId,
      nombre,
      apellidos,
      correo,
      telefono: telefono || null,
      dni,
      direccion,
      activo,
      categoria,
    });

    resetForm();
    fetchEmpleados();
  };

  const deleteEmpleado = async (id: string) => {
    await api.delete(`/empleado/${id}`);
    fetchEmpleados();
  };

  const resetForm = () => {
    setNombre("");
    setApellidos("");
    setCorreo("");
    setTelefono("");
  };

  return (
    <Container> 
      <Button onClick={() => navigate("/home")}>Volver</Button>

      <Typography variant="h4" sx={{ marginBottom: 3 }}>
        Gestión de Empleados
      </Typography>

      {/* Formulario */}
      <div style={{ marginBottom: "2rem" }}>
        <TextField
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          sx={{ marginRight: 2 }}
        />

        <TextField
          label="Apellidos"
          value={apellidos}
          onChange={(e) => setApellidos(e.target.value)}
          sx={{ marginRight: 2 }}
        />

        <TextField
          label="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          sx={{ marginRight: 2 }}
        />

        <TextField
          label="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          sx={{ marginRight: 2 }}
        />

        <Button variant="contained" onClick={addEmpleado}>
          Añadir
        </Button>
      </div>

      {/* Tabla */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Apellidos</TableCell>
            <TableCell>Correo</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {empleados.map((e) => (
            <TableRow key={e.id}>
              <TableCell>{e.nombre}</TableCell>
              <TableCell>{e.apellidos}</TableCell>
              <TableCell>{e.correo}</TableCell>
              <TableCell>{e.telefono}</TableCell>
              <TableCell>
                <Button
                  color="error"
                  onClick={() => deleteEmpleado(e.id)}
                >
                  Borrar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}