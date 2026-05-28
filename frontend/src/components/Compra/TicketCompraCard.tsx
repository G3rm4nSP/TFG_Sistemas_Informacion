import {  Card, Box, Collapse,  CardContent,  Typography, Paper,  Stack,  Divider, Button,} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RepeatIcon from "@mui/icons-material/Repeat";
import { useState } from "react";

type Props = {
    compra: any;
    repeatCompra:() => void;
};

const TicketCompraCard = ({ compra, repeatCompra }: Props) => {
  const [expandedCompra, setExpandedCompra] = useState<{ [key: string]: boolean }>({});
  console.log("Compra en TicketCompraCard:", compra);
  return((
  <Card key={compra.id}>
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
        onClick={() => setExpandedCompra((prev) => ({ ...prev, [compra.id]: !prev[compra.id] }))}
      >
        <Box sx={{ flex: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {new Date(compra.fecha).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {compra.empleado.nombre} {compra.empleado.apellidos} - {compra.local.nombre}
            </Typography>
            {compra.proveedor && <Typography variant="body2">Proveedor: {compra.proveedor.nombre}</Typography>}
          </Stack>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#667eea" }}>
            {compra.total.toFixed(2)}€
          </Typography>
          <Typography variant="caption">{compra.detalles.length} productos</Typography>
        </Box>
        <ExpandMoreIcon sx={{ transform: expandedCompra[compra.id] ? "rotate(180deg)" : "rotate(0deg)", transition: "all 0.2s" }} />
      </Stack>

      <Collapse in={expandedCompra[compra.id]} sx={{ mt: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1}>
          {compra.detalles.map((detalle:any) => (
            <Paper key={detalle.id} sx={{ p: 1.5, backgroundColor: "#f9f9f9" }}>
              <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between" }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {detalle.producto?.nombre}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {detalle.cantidad} x {detalle.precioUnidad.toFixed(2)}€
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {(detalle.cantidad * detalle.precioUnidad).toFixed(2)}€
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Collapse>
      <Button variant="contained" onClick={repeatCompra}  sx={{ mt: 2 }} startIcon={<RepeatIcon />}>
        Repetir Compra
      </Button>
      </CardContent>
  </Card>
))
}
export default TicketCompraCard;