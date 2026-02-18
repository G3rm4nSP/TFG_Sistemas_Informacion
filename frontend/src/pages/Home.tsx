import { Button, Container, Typography, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Container>
      <Typography variant="h4" sx={{ marginBottom: 4 }}>
        ERP - Panel Principal
      </Typography>

      <Stack spacing={2}>
        <Button variant="contained" onClick={() => navigate("/login")}>
          Login
        </Button>
        
        <Button variant="contained" onClick={() => navigate("/empleados")}>
          Gestión de Empleados
        </Button>

        <Button variant="contained" onClick={() => navigate("/clientes")}>
          Gestión de Clientes
        </Button>

        <Button variant="contained" onClick={() => navigate("/productos")}>
          Gestión de Productos
        </Button>

        <Button variant="contained" onClick={() => navigate("/proveedores")}>
          Gestion de Proveedores
        </Button>

      </Stack>
    </Container>
  );
}