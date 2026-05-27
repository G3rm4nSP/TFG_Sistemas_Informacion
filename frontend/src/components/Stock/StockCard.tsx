import {  Card,  CardContent,  Typography,  Stack,  Chip,  Divider,  Button,} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

type Props = {
  stock?: any;
  producto?: any;

  onMove?: () => void;
  onDiscount?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onSale?: () => void;

  isStock?: boolean;
  isCatalogo?: boolean;
  isJefe?: boolean;
  isVenta?: boolean;
};

const StockCard = ({ stock, producto, onMove, onDiscount, onDelete, onEdit, onSale, isStock=false, isCatalogo=false, isJefe=false, isVenta=false }: Props) => (

  <Card sx={{ borderLeft: "4px solid #667eea", ...((stock?.cantidad ?? producto?.stocks?.reduce((t: any, s: any) => t + s.cantidad,0)) === 0 && !isJefe && { opacity: 0.7, backgroundColor: "#f8d7dac3"})}}>
    <CardContent>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#667eea", mb: 1 }}>
          {stock?.producto?.nombre || producto?.nombre} 
        </Typography>
        {(stock?.producto?.expiracion || producto?.expiracion) && (
          <Chip label={`${new Date(stock?.producto?.expiracion || 
            producto?.expiracion).toLocaleDateString()}`} size="small" variant="outlined" sx={{ backgroundColor: "#eeff00af" }} />
        )}
      </Stack>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
        {stock?.producto?.descripcion || producto?.descripcion}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <Chip label={`${stock?.cantidad?.toFixed(0) || (producto?.stocks?.reduce((t:any, s:any) => t + s.cantidad, 0))} uds`} size="small" variant="outlined" />
        {!isStock ? (
          <Chip label={`${stock?.producto?.precioBase.toFixed(2) || producto?.precioBase.toFixed(2)} €`} size="small" variant="outlined" />
        ):(
          <Chip label={`${stock?.valor.toFixed(2)} €`} size="small" variant="outlined" sx={{ backgroundColor:stock?.valor < 0 ? "#ff00006b" :"#0080006b"  }} />
        )}
        {!isCatalogo && stock?.descuento > 0 && <Chip label={`${stock?.descuento}%`} size="small" color="error" />}
      </Stack>
      {!isCatalogo &&(
        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap" }}>
          <Typography variant="caption" sx={{ backgroundColor: "#f0f0f0", p: "4px 8px", borderRadius: "4px" }}>
            {stock?.ubicacion?.local?.nombre}
          </Typography>
          <Typography variant="caption" sx={{ backgroundColor: "#f0f0f0", p: "4px 8px", borderRadius: "4px" }}>
            {stock?.ubicacion?.tipo}
          </Typography>
          <Typography variant="caption" sx={{ backgroundColor: "#f0f0f0", p: "4px 8px", borderRadius: "4px" }}>
            {stock?.ubicacion?.descripcion}
          </Typography>
        </Stack>
      )}
      <Divider sx={{ my: 1 }} />
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
        

        {!isCatalogo && (stock?.cantidad ?? producto?.stocks?.reduce((t: any, s: any) => t + s.cantidad,0)) > 0 && (
          <Button size="small" variant="contained" startIcon={<ArrowForwardIcon />} disabled={(stock?.cantidad ?? producto?.stocks?.reduce((t: any, s: any) => t + s.cantidad,0)) === 0 && !isJefe} onClick={onMove}>
            Mover
          </Button>
        )}

        {!isCatalogo && !isStock && (stock?.cantidad ?? producto?.stocks?.reduce((t: any, s: any) => t + s.cantidad,0)) > 0 &&  (
          <Button size="small" variant="outlined" disabled={(stock?.cantidad ?? producto?.stocks?.reduce((t: any, s: any) => t + s.cantidad,0)) === 0 && !isJefe} onClick={onDiscount}>
            Descuento
          </Button>
        )}
        {!isCatalogo && stock?.cantidad === 0 && (
          <Button size="small" color="error" variant="outlined" disabled={(stock?.cantidad ?? producto?.stocks?.reduce((t: any, s: any) => t + s.cantidad,0)) === 0 && !isJefe} startIcon={<DeleteIcon />} onClick={onDelete}>
            Eliminar
          </Button>
        )}
        {isCatalogo && isJefe && (
          <Button size="small" variant="contained" disabled={!isJefe} startIcon={<EditIcon />} onClick={onEdit}>
            Editar
          </Button>
        )}
        
      </Stack>
    </CardContent>
  </Card>
);
export default StockCard;
