import { useState } from "react";
import { api } from "../api/axios";
import { Button, TextField, Box, Paper, Alert, Stack, Typography} from "@mui/material";
import { useNavigate } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";

export default function Login() {
  const navigate = useNavigate();
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkCredentials = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { mail, password });
      const { accessToken, refreshToken } = res.data;
      // Guardar tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      navigate("/home");
    } catch (error) {
      setError("Credenciales incorrectas. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    checkCredentials();
  }
};

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        px: 2, // padding responsive móvil
        boxSizing: "border-box",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
            <LockIcon sx={{ fontSize: 32 }} />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: "center", color: "#2c3e50" }}>
            ERP Sistema
          </Typography>

          <Typography variant="body2" sx={{ textAlign: "center", color: "#666" }}>
            Ingresa tus credenciales para acceder
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Stack spacing={2} sx={{ width: "100%" }}>
            <TextField label="Correo Electrónico" type="email" fullWidth value={mail} onChange={(e) => setMail(e.target.value)} onKeyDown={handleKeyPress} placeholder="correo@empresa.com" size="small" />

            <TextField label="Contraseña" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyPress} size="small" />

            <Button variant="contained" size="large" onClick={checkCredentials} disabled={loading} sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", fontWeight: 600, py: 1.5 }}>
              {loading ? "Iniciando..." : "Iniciar Sesión"}
            </Button>
          </Stack>

          <Typography variant="caption" sx={{ textAlign: "center", color: "#999", mt: 2 }}>
            Sistema de Gestión Empresarial
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}