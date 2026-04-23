import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";
import { api } from "../api/axios";

interface DetallesDashboard {
  ventasPorDia: any[];
  ventasPorEmpleado: any[];
  ventasPorLocal: any[];
  ventasProductos: any[];
}

function completarDias(evolucion: any[]) {
  const resultado: any[] = [];
  const hoy = new Date();

  for (let i = 29; i >= 0; i--) {
    const fecha = new Date();
    fecha.setDate(hoy.getDate() - i);

    const fechaStr = fecha.toISOString().split("T")[0];

    const encontrado = evolucion.find(
      (e) => e.fecha.split("T")[0] === fechaStr
    );

    const total = encontrado ? Number(encontrado.total) : 0;
    const ventas = encontrado ? Number(encontrado.ventas) : 0;

    resultado.push({
      fecha: fechaStr,
      total,
      ventas,
      ticketMedio: ventas ? total / ventas : 0,
      fluctuacion: encontrado ? Number(encontrado.fluctuacion) : 0,
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
    const res = await api.get("/dashboard/venta");
    setData(res.data);
  };

  if (!data) return null;

  const evolucionCompleta = completarDias(data.ventasPorDia);

  // 🔥 ALERTAS
  const alertas: string[] = [];

  data.ventasPorEmpleado.forEach(e => {
    if (e.total_actual < e.total_anterior) {
      alertas.push(`Empleado ${e.nombre} ha bajado ventas`);
    }
  });

  data.ventasProductos.forEach(p => {
    if (p.cantidad_actual < p.cantidad_anterior) {
      alertas.push(`Producto ${p.nombre} ha bajado ventas`);
    }
  });

  data.ventasPorLocal.forEach(l => {
    if (l.total_actual < l.total_anterior) {
      alertas.push(`Local ${l.nombre} ha bajado ventas`);
    }
  });

  return (
    <Box p={5}>
      <Typography variant="h4" mb={4}>📊 Dashboard ventas</Typography>

      <Stack direction="row" spacing={2} mb={4}>

        <DiagramaPersonalizado
            title="Ventas diarias"
            type="line"
            data={evolucionCompleta}
          />

          <DiagramaPersonalizado
            title="Ventas por empleado"
            type="bar"
            data={data.ventasPorEmpleado}
          />

          {data.ventasPorLocal.length > 1 && (
            <DiagramaPersonalizado
              title="Ventas por local"
              type="bar"
              data={data.ventasPorLocal}
            />
          )}

          <DiagramaPersonalizado
            title="Ventas por producto"
            type="bar"
            data={data.ventasProductos}
            isProduct
          />
      </Stack>
      <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>⚠️ Alertas</Typography>

            {alertas.length === 0 && (
              <Typography color="success.main">
                Todo va bien 👍
              </Typography>
            )}

            {alertas.map((a, i) => (
              <Typography key={i} color="error.main">
                • {a}
              </Typography>
            ))}
          </Paper>
    </Box>
  );
}

function DiagramaPersonalizado({
  title,
  data,
  type,
  isProduct
}: {
  title: string;
  data: any[];
  type: "line" | "bar";
  isProduct?: boolean;
}) {

  const total = data.reduce((acc, d) =>
    acc + (d.total || d.cantidad_actual || 0), 0
  );

  if (type === "line") {
    return (
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          <Typography fontWeight={600}>€ {total.toFixed(2)}</Typography>
        </Stack>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="fecha"
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString("es-ES", { day: "2-digit" })
              }
            />

            <YAxis />

            <Tooltip content={({ active, payload, label }: any) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;

              return (
                <Paper sx={{ p: 1 }}>
                  <Typography>
                    {new Date(label).toLocaleDateString("es-ES")}
                  </Typography>
                  <Typography>💰 {d.total}€</Typography>
                  <Typography>🧾 {d.ventas}</Typography>
                  <Typography>🎟️ {d.ticketMedio.toFixed(2)}€</Typography>
                </Paper>
              );
            }}/>

            <Line dataKey="total" stroke="#1976d2" strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    );
  }

  // 🔥 BARRAS COMPARATIVAS
  const formatted = data.map(d => {
    const actual = isProduct ? d.cantidad_actual : d.total_actual;
    const anterior = isProduct ? d.cantidad_anterior : d.total_anterior;
    const ventas = d.ventas || actual;

    return {
      nombre: d.nombre,
      actual,
      anterior,
      ticket: ventas ? actual / ventas : 0,
      ventas
    };
  });

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h6">{title}</Typography>
        <Typography fontWeight={600}>{total}</Typography>
      </Stack>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nombre" />
          <YAxis />

          <Tooltip content={({ active, payload }: any) => {
            if (!active || !payload?.length) return null;

            const d = payload[0].payload;

            return (
              <Paper sx={{ p: 1 }}>
                <Typography>{d.nombre}</Typography>
                <Typography>📊 {d.actual} ventas</Typography>
                <Typography>🎟️ {d.ticket.toFixed(2)}€</Typography>
              </Paper>
            );
          }}/>

          <Legend />

          {/* MES ACTUAL */}
          <Bar dataKey="actual" fill="#1976d2" />

          {/* MES ANTERIOR */}
          <Bar dataKey="anterior" fill="#4caf50" />

        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}