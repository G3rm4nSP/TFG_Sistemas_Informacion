import {
  AppBar,
  Toolbar,
  Typography,
  Stack,
  Button,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  titulo: string;
  icon: React.ReactNode;
  usuario?: any;
  onLogout: () => void;
}

export default function AppHeader({
  titulo,
  icon,
  usuario,
  onLogout,
}: Props) {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  return (
    <AppBar
      position="sticky"
      sx={{
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >

          {icon}
          {titulo}
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
        >
          {usuario && (
            <Typography
              variant="body2"
              sx={{
                display: {
                  xs: "none",
                  sm: "block",
                },
              }}
            >
              {usuario.empleado.nombre}
            </Typography>
          )}

          <Button
            onClick={(e) =>
              setAnchorEl(e.currentTarget)
            }
            sx={{
              borderRadius: "50%",
              p: 0,
              minWidth: "auto",
            }}
          >
            <Avatar
              sx={{
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              {usuario?.empleado?.nombre?.charAt(0) ||
                "U"}
            </Avatar>
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem
              onClick={() => {
                navigate("/home");
                setAnchorEl(null);
              }}
            >
              Inicio
            </MenuItem>

            <MenuItem
              onClick={() => {
                navigate("/listaDashboards");
                setAnchorEl(null);
              }}
            >
              Dashboards
            </MenuItem>

            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                onLogout();
              }}
            >
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}