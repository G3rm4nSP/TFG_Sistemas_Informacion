import {  Box, Card,  CardContent,  Typography,  Stack,  Chip,  Divider,  Button,} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

type Props = {
  proveedor?: any;
  onDelete?: () => void;
  onEdit?: () => void;
  onPedido?: () => void;

  isJefe?: boolean;
  isRRHH?: boolean;
};

const ProveedorCard = ({ proveedor, onDelete, onEdit, onPedido, isJefe, isRRHH }: Props) => (
    <Card sx={{ borderLeft: "4px solid #667eea" }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#667eea", mb: 0.5 }}>
            {proveedor.nombre}
          </Typography>

          {proveedor.descripcion && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              {proveedor.descripcion}
            </Typography>
          )}   

          <Divider />

          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Correo:</strong>
              <span>{proveedor.correo}</span>
            </Typography>
            <Typography variant="caption" sx={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Teléfono:</strong>
              <span>{proveedor.telefono}</span>
            </Typography>
              <Typography variant="caption" sx={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Horario de Entrega:</strong>
              <span>{proveedor.horarioEntrega}</span>
            </Typography>  
          </Stack>

          <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
            {(isJefe || isRRHH) && (
              <>
                <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={onEdit}>  
                    Editar
                </Button>
                <Button size="small" color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={onDelete}>
                    Eliminar
                </Button>
              </>
            )}
            
            {!isRRHH &&(
              <Button size="small" color="error" variant="outlined" startIcon={<ArrowForwardIcon />} onClick={onPedido}>
                Realizar Pedido
              </Button>
            )}
            
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

export default ProveedorCard;
