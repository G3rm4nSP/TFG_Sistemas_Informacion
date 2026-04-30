import { Button, Container, Typography, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { useEffect, useState } from "react";
import { logout } from "./Login";

function decodeToken(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function Home() {

  const [usuarioCompleto, setUsuarioCompleto] = useState<any>(null);

  const token = localStorage.getItem("accessToken");
  const user = token ? decodeToken(token) : null;

  const navigate = useNavigate();

  useEffect(() => {
    if (user?.sub) {
      fetchUsuario();
    }
    abrirSegunRol();
  }, []);

  const fetchUsuario = async () => {
    try {
      const res = await api.get(`/usuario/${user.sub}`);
      setUsuarioCompleto(res.data);
    } catch (error) {
      console.error("Error cargando usuario", error);
    }
  };

  const abrirSegunRol = () => {
    if (!user.rol) return;
    switch (user.rol) {
      case "VENTAS":
        navigate("/ventas");
        break;
      case "RRHH":
        navigate("/empleados");
        break;
      case "JEFE":
       // navigate("/listaDashboards");
        break;
    }
  };

  return (
    <Container>
<Stack direction="row" justifyContent="space-between" mb={2}>
        
          <Typography variant="h4" sx={{ marginBottom: 4 }}>
            ERP - Panel Principal
          </Typography>
        
          <Stack direction="column" spacing={2}>
            <Button variant="contained" onClick={() => logout(navigate)}>
              Cerrar sesión
            </Button>
          </Stack>
           
        </Stack>
      
      {usuarioCompleto && (
        <Typography sx={{ mb: 3 }}>
          Bienvenido, {usuarioCompleto.empleado.nombre} {usuarioCompleto.empleado.apellidos}
        </Typography>
      )}

      

      <Stack spacing={2}>
    

        <Button variant="contained" onClick={() => navigate("/empleados")}>
          Gestión de Empleados
        </Button>

        {user?.rol === "ADMIN" && (
          <Button variant="contained" onClick={() => navigate("/clientes")}>
            Gestión de Clientes
          </Button>
        )}
        <Button variant="contained" onClick={() => navigate("/productos")}>
          Gestión de Productos
        </Button>

        <Button variant="contained" onClick={() => navigate("/proveedores")}>
          Gestión de Proveedores
        </Button>

        <Button variant="contained" onClick={() => navigate("/ventas")}>
          Gestión de Ventas
        </Button>

        <Button variant="contained" onClick={() => navigate("/listaDashboards")}>
          Lista Dashboards
        </Button>
      </Stack>
    </Container>
  );
}