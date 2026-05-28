import { useEffect, useState } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useNavigate } from "react-router-dom";
import { fetchUsuario, logout } from "../services/userService";
import AppHeader from "../components/generals/AppHeader";

import {
  Box,
  Typography,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";import {
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
  const [usuarioCompleto, setUsuarioCompleto] = useState<any>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchData();
    const cargar = async () => {
          const usuario = await fetchUsuario(navigate);
          setUsuarioCompleto(usuario);
        };
        cargar();
  }, []);

  const handleLogout = () => {
    logout(navigate);
   };
  const fetchData = async () => {
    const res = await api.get("/dashboard/stock");
    setData(res.data);
  };

  if (!data) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--background)" }}>
      <AppHeader titulo="DASHBOARD STOCK" icon={<DashboardIcon />} usuario={usuarioCompleto} onLogout={handleLogout} />
      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700 }}>
            📊 Dashboard stock
          </Typography>

          <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
            <Stack direction="column" spacing={2} sx={{ flex: 1 }}>
              <Paper sx={{ p: { xs: 2, md: 3 } }}>
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <Typography variant={isMobile ? "body1" : "h6"}>
                    Productos con mayor stock
                  </Typography>
                  <Typography variant={isMobile ? "body2" : "h6"} color="text.secondary">
                    📦 {data.mayorStock?.length || 0}
                  </Typography>
                </Stack>

                <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                  <BarChart data={data.mayorStock ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="nombre"
                      tick={isMobile ? { fontSize: 12 } : {}}
                      tickFormatter={(t) =>
                        t ? (t.length > 10 ? `${t.slice(0, 10)}...` : t) : ""
                      }
                    />

                    <YAxis tick={isMobile ? { fontSize: 12 } : {}} />

                    <Tooltip content={<CustomTooltip />} />

                    <Bar dataKey="total_stock" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <KPI title="Máximo beneficio" value={`${data.maximoBeneficio.toFixed(2)} €`} />
                <KPI title="Valor stock" value={`${data.valorTotal} €`} />
              </Stack>
            </Stack>

            <Stack direction="column" spacing={2} sx={{ flex: 1 }}>
              <Paper sx={{ p: { xs: 2, md: 3 } }}>
                <TierList title="Stock bajo" unidades="uds" values={data.stockBajo} type="stock" />
              </Paper>
              <Paper sx={{ p: { xs: 2, md: 3 } }}>
                <TierList title="Caducidad próxima" unidades="uds" values={data.proximosAExpirar} type="date" />
              </Paper>
              <Paper sx={{ p: { xs: 2, md: 3 } }}>
                <TierList title="Sin colocar" unidades="uds" values={data.stockPorColocar} type="stock" />
              </Paper>
              <Paper sx={{ p: { xs: 2, md: 3 } }}>
                <TierList title="Pocas ventas" unidades="uds" values={data.productosPocasVentas} type="sales" />
              </Paper>
              <Paper sx={{ p: { xs: 2, md: 3 } }}>
                <TierList title="Rotación" unidades="" values={data.rotacionStock} type="rotation" />
              </Paper>
            </Stack>
          </Stack>
        </Stack>
      </Box>     
    </Box>
  );
}

function KPI({ title, value }: { title: string; value: any }) {
  return (
    <Box sx={{ p: 2, flex: 1 }}>
      <Stack alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant={window.innerWidth < 600 ? "body1" : "h5"} fontWeight={600}>
          {value}
        </Typography>
      </Stack>
    </Box>
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

  const allSuccess =
  safeValues.length > 0 &&
  safeValues.every((v) => getColor(v) === "success");

  if (allSuccess) {
    return (
      <Box>
        <Typography variant="h6">👍 Todo correcto</Typography>
      </Box>
    );
  } 
  return (
    <Box>
      <Typography variant={window.innerWidth < 600 ? "body1" : "h6"} mb={1}>⚠️ {title}</Typography>

      {safeValues.length === 0 && (
        <Typography variant="body2" color="text.secondary">Sin datos</Typography>
      )}

      {safeValues.map((v: any, i: number) => {
        const color = getColor(v);

        return (
          <Box key={v.id} mb={0.5}>
            <Typography variant="body2" color={`${color}.main`}>
              {i + 1}. {v.nombre} — {
                type === "rotation"
                  ? (v.rotacion ?? 0).toFixed(2)
                  : type === "sales"
                  ? v.cantidad_vendida ?? 0
                  : type === "stock" && v.cantidad_tienda !== undefined
                  ? v.cantidad_tienda
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
    </Box>
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