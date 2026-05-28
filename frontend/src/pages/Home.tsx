import {Box, Typography, Paper, Grid, useTheme, useMediaQuery} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import StorageIcon from "@mui/icons-material/Storage";
import HomeIcon from "@mui/icons-material/Home";
import FactoryIcon from "@mui/icons-material/Factory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useEffect, useState } from "react";
import { fetchUsuario, logout } from "../services/userService";
import AppHeader from "../components/generals/AppHeader";


export default function Home() {

  const [usuarioCompleto, setUsuarioCompleto] = useState<any>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      const usuario = await fetchUsuario(navigate);
      setUsuarioCompleto(usuario);
    };

    cargar();
  }, []);

  const handleLogout = () => {
    logout(navigate);
  };

  const menuItems = [
    { title: "Gestión de Empleados", route: "/empleados", icon: <PeopleIcon />, show: usuarioCompleto?.rol === "RRHH" || usuarioCompleto?.rol === "ADMIN" },
    { title: "Gestión de Clientes", route: "/clientes", icon: <PeopleIcon />, show: usuarioCompleto?.rol === "ADMIN" },
    { title: "Gestión de Productos", route: "/productos", icon: <StorageIcon />, show: usuarioCompleto?.rol === "VENTAS" || usuarioCompleto?.rol === "JEFE" || usuarioCompleto?.rol === "ADMIN" },
    { title: "Gestión de Proveedores", route: "/proveedores", icon: <FactoryIcon />, show: usuarioCompleto?.rol === "VENTAS" ||usuarioCompleto?.rol === "JEFE" || usuarioCompleto?.rol === "ADMIN" || usuarioCompleto?.rol === "RRHH" },
    { title: "Gestión de Ventas", route: "/ventas", icon: <ShoppingCartIcon />, show: usuarioCompleto?.rol === "VENTAS" ||usuarioCompleto?.rol === "JEFE" || usuarioCompleto?.rol === "ADMIN" },
    { title: "Dashboards", route: "/listaDashboards", icon: <DashboardIcon />, show: true },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--background)" }}>
      <AppHeader titulo="VISTA GENERAL" icon={<HomeIcon />} usuario={usuarioCompleto}  onLogout={handleLogout}/>

      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700, mb: 1 }}>
          Panel Principal
        </Typography>
        {usuarioCompleto && (
          <Typography variant="body2" sx={{ color: "var(--text-secondary)", mb: 3 }}>
            Bienvenido, {usuarioCompleto.empleado.nombre} {usuarioCompleto.empleado.apellidos}
          </Typography>
        )}

        <Grid container spacing={2}>
          {menuItems
            .filter((item) => item.show)
            .map((item, idx) => (
                <Paper
                  onClick={() => navigate(item.route)}
                  sx={{
                    p: 3,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 16px rgba(102, 126, 234, 0.3)",
                    },
                  }}
                >
                  <Box sx={{ fontSize: 40 }}>{item.icon}</Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {item.title}
                  </Typography>
                </Paper>
            ))}
        </Grid>
      </Box>
    </Box>
  );
}