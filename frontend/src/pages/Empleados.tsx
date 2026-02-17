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

interface Employee {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
}

export default function Employees() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");

  const fetchEmployees = async () => {
    const res = await api.get("/empleado");
    setEmployees(res.data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const addEmployee = async () => {
    await api.post("/empleado", {
      nombre,
      apellidos,
      correo,
      telefono: telefono || null,
    });

    resetForm();
    fetchEmployees();
  };

  const deleteEmployee = async (id: string) => {
    await api.delete(`/empleado/${id}`);
    fetchEmployees();
  };

  const resetForm = () => {
    setNombre("");
    setApellidos("");
    setCorreo("");
    setTelefono("");
  };

  return (
    <Container>
      <Button onClick={() => navigate("/")}>Volver</Button>

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

        <Button variant="contained" onClick={addEmployee}>
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
          {employees.map((e) => (
            <TableRow key={e.id}>
              <TableCell>{e.nombre}</TableCell>
              <TableCell>{e.apellidos}</TableCell>
              <TableCell>{e.correo}</TableCell>
              <TableCell>{e.telefono}</TableCell>
              <TableCell>
                <Button
                  color="error"
                  onClick={() => deleteEmployee(e.id)}
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