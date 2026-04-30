import { useState } from "react";
import { api } from "../api/axios";
import {
  Button,
  TextField,
  Container,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export const logout = (navigate: any) => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  navigate("/login");
};

export default function Login() {
  const navigate = useNavigate();

  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");

  const checkCredentials = async () => {
    try {
      const res = await api.post("/auth/login", {
        mail,
        password,
      });

      const { accessToken, refreshToken } = res.data;

      // Guardar tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      navigate("/home");

    } catch (error) {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ marginBottom: 3 }}>
        LOGIN ERP EMPRESARIAL
      </Typography>

      <div style={{ marginBottom: "2rem" }}>
        <TextField
          label="CORREO EMPRESARIAL"
          value={mail}
          onChange={(e) => setMail(e.target.value)}
          sx={{ marginRight: 2 }}
        />

        <TextField
          type="password"
          label="CONTRASEÑA"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ marginRight: 2 }}
        />

        <Button variant="contained" onClick={checkCredentials}>
          INICIAR SESIÓN
        </Button>
      </div>
    </Container>
  );
}