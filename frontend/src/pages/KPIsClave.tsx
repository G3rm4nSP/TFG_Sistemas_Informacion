import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer} from "recharts";
import { api } from "../api/axios";

interface DetallesDashboard {
  evolucion : { fecha: string; total: number }[];
  ingresosHoy : number;
  ingresosMes : number;
  ticketMedio : number;
  topEmpleadosBeneficios : { nombre: string; apellidos: string; total: number }[];
  topEmpleadosVentas : { nombre: string; apellidos: string; ventas: number }[];
  topProductos : { nombre: string; cantidad: number }[];
}

function decodeToken(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function completarDias(evolucion: any[]) {
  const resultado: { fecha: string; total: number }[] = [];

  const hoy = new Date();

  for (let i = 29; i >= 0; i--) {
    const fecha = new Date();
    fecha.setDate(hoy.getDate() - i);

    const fechaStr = fecha.toISOString().split("T")[0];

    const encontrado = evolucion.find(
      (e) => e.fecha.split("T")[0] === fechaStr
    );

    resultado.push({
      fecha: fechaStr,
      total: encontrado ? Number(encontrado.total) : 0,
    });
  }

  return resultado;
}

export default function KPIsClave() {
  /*
  💰 Ingresos hoy / mes
  📈 Evolución de ventas (gráfico)
  🧾 Ticket medio
  🛒 Nº ventas
  👤 Clientes nuevos
  ⚠️ Productos con stock bajo
  🏆 Top 5 productos
  👨‍💼 Top 3 empleados 
  */
  const [data, setData] = useState<DetallesDashboard | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/venta/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Error al cargar datos del dashboard", err);
    }
  };

  if (!data) return null;

  const evolucionCompleta = completarDias(data.evolucion);

  return (
    <Box p={5}>
      <Paper sx={{ p: 4 }}>

        {/* 🔥 KPIs */}
        <Stack direction="row" spacing={2} mb={4}>
          <KPI title="Ingresos hoy" value={`${data.ingresosHoy} €`} />
          <KPI title="Ingresos mes" value={`${data.ingresosMes} €`} />
          <KPI title="Ticket medio" value={`${data.ticketMedio} €`} />
          <KPI title="Ventas" value={data.evolucion.length} />
          <KPI title="Clientes nuevos" value={0} />
        </Stack>

        {/* 📈 GRÁFICA */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" mb={2}>
            Evolución de ventas últimos 30 días
          </Typography>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolucionCompleta}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="fecha"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    //month: "2-digit",
                  })
                }
              />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* 🏆 BLOQUES INFERIORES */}
        <Stack direction="row" spacing={2}>

          {/* Top productos */}
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6" mb={2}>
              Top productos
            </Typography>

            {data.topProductos.map((p: any, i: number) => (
              <Typography key={p.id}>
                {i + 1}. {p.nombre} — {p.cantidad} uds
              </Typography>
            ))}
          </Paper>

          {/* Top ventas empleados */}
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6" mb={2}>
              Top venta empleados
            </Typography>

            {data.topEmpleadosVentas.map((e: any, i: number) => (
              <Typography key={e.id}>
                {i + 1}. {e.nombre} — {e.ventas} ventas
              </Typography>
            ))}
          </Paper>


          {/* Top Beneficios empleados */}
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6" mb={2}>
              Top beneficios empleados
            </Typography>

            {data.topEmpleadosBeneficios.map((e: any, i: number) => (
              <Typography key={e.id}>
                {i + 1}. {e.nombre} — {e.total} €
              </Typography>
            ))}
          </Paper>

          {/* Stock bajo 
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6" mb={2}>
              ⚠️ Stock bajo
            </Typography>

            {data.stockBajo.map((p: any) => (
              <Typography key={p.id} color="error">
                {p.nombre} — {p.cantidad} uds
              </Typography>
            ))}
          </Paper>*/}

        </Stack>
      </Paper>
    </Box>
  );
}

/* 🔥 COMPONENTE KPI reutilizable */
function KPI({ title, value }: { title: string; value: any }) {
  return (
    <Paper sx={{ p: 2, flex: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5" fontWeight={600}>
        {value}
      </Typography>
    </Paper>
  );
}