import {  Button, Card, Box, TextField, CardContent,  Typography,  Stack, IconButton} from "@mui/material";


import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";

type Props = {
    detalle: any;
    onQuantityChange: (cantidad: number) => void;
    onRemove: () => void;
};

const CarritoItem = ({ detalle, onQuantityChange, onRemove }: Props) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "start" }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {detalle.producto?.nombre}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {detalle.producto?.descripcion}
              </Typography>
            </Box>
            <IconButton size="small" color="error" onClick={onRemove}>
              <DeleteIcon />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Button size="small" variant="outlined" onClick={() => onQuantityChange(detalle.cantidad - 1)}>
                <RemoveIcon sx={{ fontSize: 16 }} />
              </Button>
              <TextField
                type="number"
                value={detalle.cantidad}
                onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
                sx={{ width: 60, "& input": { textAlign: "center" } }}
                size="small"
              />
              <Button size="small" variant="outlined" onClick={() => onQuantityChange(detalle.cantidad + 1)}>
                <AddIcon sx={{ fontSize: 16 }} />
              </Button>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {(detalle.precioFinal * detalle.cantidad).toFixed(2)}€
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ fontSize: "0.85rem" }}>
            <Typography variant="caption">Base: {detalle.precioSinIva.toFixed(2)}€</Typography>
            {detalle.descuento > 0 && <Typography variant="caption" sx={{ color: "error.main" }}>Desc: {detalle.descuento}%</Typography>}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
  export default CarritoItem;