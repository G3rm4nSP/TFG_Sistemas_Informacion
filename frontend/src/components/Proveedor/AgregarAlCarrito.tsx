import { useState, } from "react";
import {  Dialog,  DialogTitle,  DialogContent,  DialogActions,  Button,  Stack,  TextField,Paper, Typography } from "@mui/material";
import AppSnackbars from "../generals/AppSnackbars";

type Props = {
  open: boolean;
  onClose: () => void;
  onAgregar?: () => void;
  formData: any; 
  setFormData: (data: any) => void;
};

export function AgregarAlCarrito({
  open,
  onClose,
  onAgregar,
  formData,   
  setFormData,  
 
}: Props) {
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
          Cantidad - {formData.nombre}
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Cantidad"
              value={formData.cantidad || ""}
              onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Precio por unidad (€)"
              value={formData.precioUnidad ?? ""}
              onChange={(e) => setFormData({ ...formData, precioUnidad: e.target.value })}
              fullWidth
              size="small"
              type="number"
              inputMode="decimal"
            />

            {formData.expiracion && (
              <TextField
                label="Fecha de expiración"
                value={formData.expiracion ? new Date(formData.expiracion).toISOString().split("T")[0] : ""}
                onChange={(e) => setFormData({ ...formData, expiracion: new Date(e.target.value) })}
                fullWidth
                size="small"
                type="date"
              />
            )}

            <Paper sx={{ p: 2, backgroundColor: "#f5f7fa", borderRadius: 2 }}>
              <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
                  Precio Total:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#667eea" }}>
                  {(parseFloat(formData.precioUnidad || "0") * parseFloat(formData.cantidad || "0")).toFixed(2)}€
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => onClose()}>Cancelar</Button>
          <Button variant="contained" onClick={onAgregar} sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            Agregar al Carrito
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
