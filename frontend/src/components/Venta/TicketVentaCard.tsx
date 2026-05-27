import {  Card, Box, Collapse,  CardContent,  Typography, Paper,  Stack,  Divider,} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";

type Props = {
    venta: any;
};

const TicketVentaCard = ({ venta }: Props) => {
  const [expandedVenta, setExpandedVenta] = useState<{ [key: string]: boolean }>({});
  return((
  <Card key={venta.id}>
    <CardContent>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          "&:hover": { backgroundColor: "#f5f5f5" },
        }}
        onClick={() => setExpandedVenta((prev) => ({ ...prev, [venta.id]: !prev[venta.id] }))}
      >
        <Box sx={{ flex: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {new Date(venta.fecha).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {venta.empleado.nombre} {venta.empleado.apellidos} - {venta.local.nombre}
            </Typography>
            {venta.cliente && <Typography variant="body2">Cliente: {venta.cliente.nombre}</Typography>}
          </Stack>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#667eea" }}>
            {venta.total.toFixed(2)}€
          </Typography>
          <Typography variant="caption">{venta.detalles.length} productos</Typography>
        </Box>
        <ExpandMoreIcon sx={{ transform: expandedVenta[venta.id] ? "rotate(180deg)" : "rotate(0deg)", transition: "all 0.2s" }} />
      </Stack>

      <Collapse in={expandedVenta[venta.id]} sx={{ mt: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1}>
          {venta.detalles.map((detalle:any) => (
            <Paper key={detalle.productoId} sx={{ p: 1.5, backgroundColor: "#f9f9f9" }}>
              <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between" }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {detalle.producto?.nombre}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {detalle.cantidad} x {detalle.precioFinal.toFixed(2)}€
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {(detalle.cantidad * detalle.precioFinal).toFixed(2)}€
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Collapse>
    </CardContent>
  </Card>
))
}
export default TicketVentaCard;