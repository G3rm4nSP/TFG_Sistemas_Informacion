import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar, Pie, Legend, Cell} from "recharts";
import { api } from "../api/axios";
import { PieChart } from "@mui/icons-material";

interface DetallesDashboard {
  ventasPorDia: { fecha: string; total: number; ventas: number; ticketMedio: number; fluctuacion: number }[]; 
  ventasPorEmpleado: {nombre: string; total_actual: number; total_anterior: number; ventas: number; ticketMedio: number}[];
  ventasPorLocal: {nombre: string; total_actual: number; total_anterior: number; ventas: number; ticketMedio: number}[];
  ventasProductos: {nombre: string; cantidad_actual: number; cantidad_anterior: number; total: number; precioMedio: number}[];
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

export default function DashboardVentas() {
  const [data, setData] = useState<DetallesDashboard | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/dashboard/venta");
      setData(res.data);
    } catch (err) {
      console.error("Error al cargar datos del dashboard", err);
    }
  };


  if (!data) return null;

  const evolucionCompleta = completarDias(data.ventasPorDia);
  return (
    <Box p={5}>
      <Paper sx={{ p: 4 }}>
        < Typography variant="h4" mb={4}> 📊 Dashboard ventas</Typography>
          <DiagramaPersonalizado title="Ventas diarias" type="line" data={evolucionCompleta}/>
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

function DiagramaPersonalizado({
  title,
  data,
  type,
  xKey = "fecha",
  yKey = "total",
  secondary,
  trend,
  percent,
  icon,
}: {  title: string; data: any[]; type: "line" | "bar" | "pie"; xKey?: string; yKey?: string; secondary?: string; trend?: number; percent?: number; icon?: string }) {
  const COLORS = ["#1976d2", "#42a5f5", "#90caf9", "#0d47a1"];

  return (
  <Paper sx={{ p: 3, mb: 4 }}>
                <Stack direction="row" justifyContent='space-between' mb={2} alignItems="center">  
                  <Typography variant="h6" mb={2}>{title}</Typography>
                </Stack>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data}>
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
              );
}


function TierList({title, unidades, values, alert, date}: {title: string; unidades: string; values: any[]; alert?: boolean; date?: boolean}) {

  const max = Math.max(...values.map(v => v.cantidad));

  return (
    <Paper sx={{ p: 1, flex: 1 }}>
      <Typography variant="h6" mb={2}>
        {alert ? "⚠️ " : ""} {title}
      </Typography>

      {values.map((v: any, i: number) => {
        let color: "error" | "warning" | "success" = "warning";

        if (date && v.expiracion) {
          const diff = new Date(v.expiracion).getTime() - Date.now();

          if (diff < 3 * 24 * 60 * 60 * 1000) color = "error";
          else if (diff < 7 * 24 * 60 * 60 * 1000) color = "warning";
          else color = "success";
        }

        return (
          <Box key={v.id}>
            {!alert ? (
              <>
                <Typography>
                  {i + 1}. {v.nombre} — {v.cantidad} {unidades}
                </Typography>

                <Box sx={{height: 6, width: "100%", bgcolor: "grey.200", borderRadius: 2, mt: 0.5,}}>
                  <Box sx={{ height: "100%", width: `${(v.cantidad / max) * 100}%`, bgcolor: "primary.main", borderRadius: 2,}}/>
                </Box>
              </>
            ) : (
              <>
                {date && v.expiracion ? (
                  <>
                    <Typography variant="h6" color={color}>
                      {i + 1}. {v.nombre} — {v.cantidad} {unidades}
                    </Typography>

                    <Typography variant="body2" color={color}>
                      F.Cad {new Date(v.expiracion).toLocaleDateString("es-ES")}
                    </Typography>
                  </>
                ) : (
                  <Typography
                    variant="h6"
                    color={v.cantidad < 10 ? "error" : "warning"}
                  >
                    {i + 1}. {v.nombre} — {v.cantidad} {unidades}
                  </Typography>
                )}
              </>
            )}
          </Box>
        );
      })}
    </Paper>
  );
};

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const trend = data.fluctuacion;
    if (data.total === 0 && data.ventas === 0) return null;
    return (
      <Paper sx={{ p: 1 }}>
        <Stack>
          <Typography variant="body2">
            {new Date(label).toLocaleDateString("es-ES")}
          </Typography>

          {trend !== undefined && trend > 0 && <Typography color="success.main">▲</Typography>}
          {trend !== undefined && trend < 0 && <Typography color="error.main">▼</Typography>}
          {trend !== undefined && trend === 0 && <Typography color="warning.main">■</Typography>}
          {trend === undefined && <Typography color="warning.main">■</Typography>}

        </Stack>
        <Typography color="primary">
          💰 {data.total} €
        </Typography>

        <Typography color="text.secondary">
          🧾 {data.ventas} ventas
        </Typography>

        <Typography color="text.secondary">
          🧾 {data.ticketMedio?.toFixed(2)} € promedio
        </Typography>

      </Paper>
    );
  }

  return null;
}