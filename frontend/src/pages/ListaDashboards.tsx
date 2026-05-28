import { Box, Paper, Typography, Grid, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchUsuario, logout } from "../services/userService";
import AppHeader from "../components/generals/AppHeader";
import DashboardIcon from "@mui/icons-material/Dashboard";

export default function ListaDashboards() {
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

  const dashboards = [
    { title: "Dashboard General", route: "/listaDashboards/DashboardGeneral", roles: ["JEFE", "ADMIN"] },
    { title: "Dashboard Ventas", route: "/listaDashboards/DashboardVentas", roles: ["JEFE", "VENTAS"] },
    { title: "Dashboard Stock", route: "/listaDashboards/DashboardStock", roles: ["JEFE", "VENTAS"] },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--background)" }}>
      <AppHeader titulo="DASHBOARDS" icon={<DashboardIcon />} usuario={usuarioCompleto} onLogout={handleLogout} />
      
      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700, mb: 1 }}>
          Selecciona un Dashboard
        </Typography>
        {usuarioCompleto && (
          <Typography variant="body2" sx={{ color: "var(--text-secondary)", mb: 3 }}>
            Bienvenido, {usuarioCompleto.empleado.nombre} {usuarioCompleto.empleado.apellidos}
          </Typography>
        )}

        <Grid container spacing={2}>
          {dashboards
            .filter((item) => usuarioCompleto && item.roles.includes(usuarioCompleto.rol))
            .map((item, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Paper
                  onClick={() => navigate(item.route)}
                  sx={{
                    p: 3,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 120,
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 16px rgba(102, 126, 234, 0.3)",
                    },
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600, textAlign: "center" }}>
                    {item.title}
                  </Typography>
                </Paper>
              </Grid>
            ))}
        </Grid>
      </Box>
    </Box>
  );
}