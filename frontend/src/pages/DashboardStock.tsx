import { useEffect, useState } from "react";
import { Box, Typography, Paper, Stack } from "@mui/material";
import {
  XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { api } from "../api/axios";

interface DetallesDashboard {
  mayorStock: any[];
  stockBajo: any[];
  proximosAExpirar: any[];
  stockPorColocar: any[];
  valorTotal: number;
  maximoBeneficio: number;
  productosPocasVentas: any[];
  rotacionStock: any[];
}

export default function DashboardStock() {
  const [data, setData] = useState<DetallesDashboard | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await api.get("/dashboard/stock");
    setData(res.data);
  };

  if (!data) return null;

  return (
    <Box p={5}>
      <Paper sx={{ p: 4 }}>
        <Stack direction="row" spacing={10} alignItems="center">

          <Stack direction="column" spacing={4} flex={1.5}>
            <Typography variant="h4">📊 Dashboard stock</Typography>

            <Paper sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  Productos con mayor stock
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  📦 {data.mayorStock?.length || 0}
                </Typography>
              </Stack>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.mayorStock ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="nombre"
                    tickFormatter={(t) =>
                      t ? (t.length > 10 ? `${t.slice(0, 10)}...` : t) : ""
                    }
                  />

                  <YAxis />

                  <Tooltip content={<CustomTooltip />} />

                  <Bar dataKey="total_stock" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            <Stack direction="row" spacing={2}>
              <KPI title="Máximo beneficio" value={`${data.maximoBeneficio.toFixed(2)} €`} />
              <KPI title="Valor stock" value={`${data.valorTotal} €`} />
            </Stack>
          </Stack>

          <Stack direction="column" spacing={3} flex={1}>
            <TierList title="Stock bajo" unidades="uds" values={data.stockBajo} type="stock" />
            <TierList title="Caducidad próxima" unidades="uds" values={data.proximosAExpirar} type="date" />
            <TierList title="Sin colocar" unidades="uds" values={data.stockPorColocar} type="stock" />
            <TierList title="Pocas ventas" unidades="uds" values={data.productosPocasVentas} type="sales" />
            <TierList title="Rotación" unidades="" values={data.rotacionStock} type="rotation" />
          </Stack>

        </Stack>
      </Paper>
    </Box>
  );
}

function KPI({ title, value }: { title: string; value: any }) {
  return (
    <Paper sx={{ p: 2, flex: 1 }}>
      <Stack alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={600}>
          {value}
        </Typography>
      </Stack>
    </Paper>
  );
}

function TierList({
  title,
  unidades,
  values,
  type
}: {
  title: string;
  unidades: string;
  values?: any[] | null;
  type: "stock" | "date" | "sales" | "rotation";
}) {

  const safeValues = values ?? [];

  const getColor = (v: any): "error" | "warning" | "success" => {

    if (type === "date" && v.expiracion) {
      const diff = new Date(v.expiracion).getTime() - Date.now();
      if (diff < 5 * 86400000) return "error";
      if (diff < 15 * 86400000) return "warning";
      return "success";
    }

    if (type === "rotation") {
      const r = v.rotacion ?? 0;
      if (r <= 0.5) return "error";
      if (r <= 1) return "warning";
      return "success";
    }

    if (type === "sales") {
      const c = v.cantidad_vendida ?? 0;
      if (c < 5) return "error";
      if (c < 10) return "warning";
      return "success";
    }

    const c = v.cantidad ?? v.total_stock ?? 0;
    if (c < 10) return "error";
    if (c < 20) return "warning";
    return "success";
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" mb={2}>⚠️ {title}</Typography>

      {safeValues.length === 0 && (
        <Typography color="text.secondary">Sin datos</Typography>
      )}

      {safeValues.map((v: any, i: number) => {
        const color = getColor(v);

        return (
          <Box key={v.id} mb={1}>
            <Typography color={`${color}.main`}>
              {i + 1}. {v.nombre} — {
                type === "rotation"
                  ? (v.rotacion ?? 0).toFixed(2)
                  : type === "sales"
                  ? v.cantidad_vendida ?? 0
                  : v.cantidad ?? v.total_stock ?? 0
              } {unidades}
            </Typography>

            {type === "date" && v.expiracion && (
              <Typography variant="body2" color={`${color}.main`}>
                {new Date(v.expiracion).toLocaleDateString("es-ES")}
              </Typography>
            )}
          </Box>
        );
      })}
    </Paper>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;

    return (
      <Paper sx={{ p: 1 }}>
        <Typography>{d.nombre}</Typography>
        <Typography>📦 {d.total_stock} uds</Typography>
      </Paper>
    );
  }
  return null;
}