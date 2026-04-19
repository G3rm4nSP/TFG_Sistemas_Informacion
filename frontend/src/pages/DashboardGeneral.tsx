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
  evolucion : { fecha: string; total: number; ventas: number }[];
  ingresosHoy : number;
  ingresosAyer : number;
  ingresosMes : number;
  ingresosMesAnterior : number;
  ticketMedio : number;
  ticketMedioMesAnterior : number;
  topEmpleadosBeneficios : { nombre: string; apellidos: string; cantidad: number }[];
  topEmpleadosVentas : { nombre: string; apellidos: string; cantidad: number }[];
  topProductos : { nombre: string; cantidad: number }[];
  clientesNuevos : number;
  stockBajo : { nombre: string; cantidad: number }[];
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
  const resultado: { fecha: string; total: number; ventas: number }[] = [];

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
      ventas: encontrado ? Number(encontrado.ventas) : 0,
    });
  }

  return resultado;
}

export default function DashboardGeneral() {
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
  const totalVentas30d = data.evolucion.reduce((acc, d) => acc + d.ventas, 0);
  return (
    <Box p={5}>
      <Paper sx={{ p: 4 }}>
        <Stack direction="row" spacing={10} mb={4} alignItems="center">
          <Stack direction="column" spacing={4} mb={4}>
            <Stack direction="row" spacing={2} mb={4}>
              <KPI title="Ingresos hoy" value={`${data.ingresosHoy} €`} secondary={`Hace un día(€): ${data.ingresosAyer} €`} 
                trend={data.ingresosHoy > data.ingresosAyer ? 1 : data.ingresosHoy < data.ingresosAyer ? -1 : 0} />
              <KPI title="Ingresos mes" value={`${data.ingresosMes} €`} secondary={`Mes anterior(€): ${data.ingresosMesAnterior} €`} 
                trend={data.ingresosMes > data.ingresosMesAnterior ? 1 : data.ingresosMes < data.ingresosMesAnterior ? -1 : 0} />
              <KPI title="Ticket medio" value={`${data.ticketMedio} €`} secondary="Mes anterior (%):"
                percent={(data.ticketMedio - data.ticketMedioMesAnterior)/data.ticketMedioMesAnterior * 100 || 0} />
              <KPI title="Clientes nuevos" value={`${data.clientesNuevos} personas`} icon="👤" />
            </Stack>

            <Paper sx={{ p: 3, mb: 4 }}>
              <Stack direction="row" justifyContent='space-between' mb={2} alignItems="center">  
                <Typography variant="h6" mb={2}>
                  Evolución de ventas últimos 30 días
                </Typography>

                <Typography variant="h5" color="text.secondary">
                  🧾 {totalVentas30d} ventas
                </Typography>
              </Stack>
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
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#1976d2"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Stack>

          <Stack direction="column" spacing={5} flex={1}>

            <TierList title="Top productos vendidos" unidades="uds" values={data.topProductos} />
            <TierList title="Top ventas empleados" unidades="ventas" values={data.topEmpleadosVentas} />
            <TierList title="Top beneficios empleados" unidades="€" values={data.topEmpleadosBeneficios} />
            <TierList title="⚠️ Stock bajo" unidades="uds" values={data.stockBajo} type="alert" />
            {/* Stock bajo */}
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="h6" mb={2}>
                ⚠️ Stock bajo
              </Typography>

              {data.stockBajo.map((p: any) => (
                <Typography key={p.id} color="error">
                  {p.nombre} — {p.cantidad} uds
                </Typography>
              ))}
            </Paper>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

function KPI({ title, value, secondary, trend , percent, icon}: { title: string; value: any; secondary?: string; trend?: number, percent?: number, icon?: string }) {
  let color: "success" | "error" | "warning" | "info" | "primary" | "secondary" | undefined;

  if (trend === 1) color = "success";
  else if (trend === -1) color = "error";
  else if (trend === 0) color = "warning";

  return (
    <Paper sx={{ p: 2, flex: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Stack direction="column" spacing={0.5} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={600} color={color || "text.primary"}>
            {value}
          </Typography>

          {secondary && (
            <Typography variant="body2" color="text.secondary">
              {secondary}
            </Typography>
          )}

          {percent !== undefined && percent > 0 && <Typography fontWeight={400} color="success.main">+ {percent.toFixed(1)}%</Typography>}
          {percent !== undefined && percent < 0 && <Typography fontWeight={400} color="error.main">- {percent.toFixed(1)}%</Typography>}
          {percent !== undefined && percent === 0 && <Typography fontWeight={400} color="warning.main">0%</Typography>}
          {icon !== undefined && <Typography variant="h4" color={color}> {icon}</Typography>}

        </Stack>
        {trend === 1 && <Typography color="success.main">▲</Typography>}
        {trend === -1 && <Typography color="error.main">▼</Typography>}
        {trend === 0 && <Typography color="warning.main">■</Typography>}
      </Stack>
    </Paper>
  );
}

// function TierList({title, unidades, values}: {title: string; unidades: string; values: any[]}) {

//   return (
//     <Paper sx={{ p: 2, flex: 1 }}>
//       <Typography variant="h6" mb={2}> {title} </Typography>

//       {values.map((v: any, i: number) => (
//         <Typography key={v.id}>
//           {i + 1}. {v.nombre} — {v.cantidad && `${v.cantidad}` ||`0`} {unidades}
//         </Typography>
//       ))}
//     </Paper>
//   );
// };

function TierList({
  title,
  unidades,
  values,
  type = "default", // "default" | "money" | "alert"
}: {
  title: string;
  unidades: string;
  values: { nombre: string; cantidad: number }[];
  type?: "default" | "money" | "alert";
}) {
  const max = Math.max(...values.map((v) => v.cantidad), 1);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" mb={2}>
        {title}
      </Typography>

      <Stack spacing={1}>
        {values.map((v, i) => {
          const percent = (v.cantidad / max) * 100;

          let color = "primary.main";

          // 🎨 lógica de colores
          if (type === "money") {
            color = v.cantidad >= 0 ? "success.main" : "error.main";
          }

          if (type === "alert") {
            if (v.cantidad === 0) color = "error.main";
            else if (v.cantidad < 5) color = "warning.main";
          }

          return (
            <Box key={i}>
              {/* Texto */}
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">
                  {i + 1}. {v.nombre}
                </Typography>

                <Typography variant="body2" fontWeight={600}>
                  {v.cantidad} {unidades}
                </Typography>
              </Stack>

              {/* Barra */}
              <Box
                sx={{
                  height: 6,
                  width: "100%",
                  bgcolor: "grey.200",
                  borderRadius: 2,
                  mt: 0.5,
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${percent}%`,
                    bgcolor: color,
                    borderRadius: 2,
                    transition: "0.3s",
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.total === 0 && data.ventas === 0) return null;
    return (
      <Paper sx={{ p: 1 }}>
        <Typography variant="body2">
          {new Date(label).toLocaleDateString("es-ES")}
        </Typography>

        <Typography color="primary">
          💰 {data.total} €
        </Typography>

        <Typography color="text.secondary">
          🧾 {data.ventas} ventas
        </Typography>
      </Paper>
    );
  }

  return null;
}