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
  }, []);

  const fetchUsuario = async () => {
    try {
      const res = await api.get(`/usuario/${user.sub}`);
      setUsuarioCompleto(res.data);
    } catch (error) {
      console.error("Error cargando usuario", error);
    }
  };

  return (
    <Container>
      <Stack direction="row" justifyContent="space-between" mb={2}>

        <Typography variant="h4" sx={{ marginBottom: 4 }}>
          ERP - Lista de Dashboards
        </Typography>

        <Stack direction="column" spacing={2}>

          <Button variant="contained" onClick={() => logout(navigate)}>
            Cerrar sesión
          </Button>

          {user?.rol === "VENTAS" && (
            <Button variant="contained" onClick={() => navigate("/ventas")}>
              Volver a ventas
            </Button>
          )}

          {user?.rol === "JEFE" && (
            <Button variant="contained" onClick={() => navigate("/home")}>
              Volver atras
            </Button>
          )}
        </Stack>
        
      </Stack>
      {usuarioCompleto && (
        <Typography sx={{ mb: 3 }}>
          Bienvenido, {usuarioCompleto.empleado.nombre} {usuarioCompleto.empleado.apellidos}
        </Typography>
      )}

      <Stack spacing={2}>
        {(user?.rol === "JEFE" || user?.rol === "ADMIN") && (
          <Button variant="contained" onClick={() => navigate("/listaDashboards/DashboardGeneral")}>
            Dashboard General
          </Button>
        )}

        {(user?.rol === "JEFE" || user?.rol === "VENTAS") && (
          <Button variant="contained" onClick={() => navigate("/listaDashboards/DashboardVentas")}>
            Dashboard Ventas
          </Button>
        )}

        {(user?.rol === "JEFE" || user?.rol === "VENTAS") && (
          <Button variant="contained" onClick={() => navigate("/listaDashboards/DashboardStock")}>
            Dashboard Stock
          </Button>
        )}
        

      </Stack>
    </Container>
  );
}