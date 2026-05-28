import { useState, useEffect } from "react";
import {  Dialog,  DialogTitle,  DialogContent,  DialogActions,  Button,  Stack,  TextField,Switch, FormControlLabel } from "@mui/material";
import AppSnackbars from "../generals/AppSnackbars";
import { api } from "../../api/axios";

interface Producto {
  id: string;
  nombre: string;
  descripcion : string;
  tipo: string;
  porcentajeIVA: number;
  precioBase: number;
  expiracion: Date;
  cantidad: number;
  descuento: number;
  updatedAt: Date;
  localId: string;
  tipoUbicacion: string;
  descripcionUbicacion: string;
  stocks : {
    cantidad: number;
  }[];
}

type Props = {
  open: boolean;
  onClose: () => void;
  isEdit: boolean;
  fetchCatalogoProductos: () => void;
  fetchStock: () => void;
  editingProducto: Producto | null;
};

export function CrearEditarProducto({
  open,
  onClose,
  isEdit,
  fetchCatalogoProductos,
  fetchStock,
  editingProducto,
}: Props) {
  const [formData, setFormData] = useState<any>({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  useEffect(() => {
    if (isEdit && editingProducto) {
      setFormData({ 
        nombre: editingProducto.nombre,
        descripcion: editingProducto.descripcion,
        tipo: editingProducto.tipo,
        porcentajeIVA: editingProducto.porcentajeIVA,
        precioBase: editingProducto.precioBase,
        expiracion: editingProducto.expiracion ? new Date(editingProducto.expiracion).toISOString().split("T")[0] : null,
      });
    }
  }, [isEdit, editingProducto]);

  const handleEditProducto = async() => {
    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        porcentajeIVA: parseFloat(formData.porcentajeIVA),
        precioBase: parseFloat(formData.precioBase),
        expiracion: formData.expiracion || null,
      };
    
      await api.patch(`/producto/${editingProducto?.id}`, payload);
      setSuccessMsg("Producto actualizado correctamente");
      fetchCatalogoProductos();
      fetchStock();
    } catch (error) {
      console.error("Error editando producto:", error);
      setErrorMsg("Error editando producto");
    }
    onClose();
    setFormData({});
  };
  
  const handleCreateProducto = async () => {
    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        porcentajeIVA: parseFloat(formData.porcentajeIVA),
        precioBase: parseFloat(formData.precioBase),
        expiracion: formData.expiracion || null,
      };
    
      await api.post("/producto", payload);
      setSuccessMsg("Producto creado correctamente");
      fetchCatalogoProductos();
    } catch (error) {
      console.error("Error creando producto:", error);
      setErrorMsg("Error creando producto");
    }
    onClose();
    setFormData({});
  };
    
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField label="Nombre" fullWidth value={formData.nombre || ""} 
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
            <TextField label="Descripción" fullWidth value={formData.descripcion || ""} 
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} />
            <TextField label="Tipo" fullWidth value={formData.tipo || ""} 
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} />
            <TextField label="Porcentaje IVA (%)" type="number" value={formData.porcentajeIVA || ""}
              onChange={(e) => setFormData({...formData, porcentajeIVA: Number(e.target.value),})}/>
            <TextField label="Precio Base" type="number" fullWidth value={formData.precioBase || ""} 
              onChange={(e) => setFormData({ ...formData, precioBase: e.target.value })} />
            <FormControlLabel
              control={
                  <Switch
                  checked={!!formData.expiracion}
                  onChange={(e) =>
                      setFormData({
                      ...formData,
                      expiracion: e.target.checked
                          ? new Date()
                          : null,
                      })
                  }
                  />
              }
              label="Producto con fecha de expiración"
              />
            {formData.expiracion && (
              <TextField
                  label="Fecha de expiración"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={
                  formData.expiracion
                      ? new Date(formData.expiracion)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                  setFormData({
                      ...formData,
                      expiracion: new Date(e.target.value),
                  })
                  }
              />
              )}
            
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={isEdit ? handleEditProducto : handleCreateProducto}>
            {isEdit ? "Editar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
      <AppSnackbars successMsg={successMsg} errorMsg={errorMsg} setSuccessMsg={setSuccessMsg} setErrorMsg={setErrorMsg}/>  
    </>
  );
};

type Props2 = {
  open: boolean;
  idDescuento: string;
  onClose: () => void;
  fetchStock: () => void;
};

export function AplicarDescuento({
  open,
  idDescuento,
  onClose,
  fetchStock,
}: Props2)  {
  
  const [formData, setFormData] = useState<any>({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleDescuentoStock = async() =>{
    const payload ={
      descuento: parseFloat(formData.descuento)
    }

    try {
      console.log("Aplicando descuento con payload:", payload, "al stock con ID:", idDescuento);
      await api.patch(`/stock/${idDescuento}`, payload);
      setSuccessMsg("Descuento aplicado correctamente")
      fetchStock();
    } catch (error) {
      console.error("Error aplicando descuento:", error);
      setErrorMsg("Error al aplicar el descuento. Inténtalo de nuevo.");      
    }
      
      onClose();
  }
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Aplicar Descuento</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField label="Descuento %" type="number" fullWidth value={formData.descuento || ""} onChange={(e) => setFormData({ ...formData, descuento: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleDescuentoStock}>
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>
      <AppSnackbars successMsg={successMsg} errorMsg={errorMsg} setSuccessMsg={setSuccessMsg} setErrorMsg={setErrorMsg}/>  
    </>
  );
};


