import { useState, useEffect } from "react";
import {  Dialog,  DialogTitle,  DialogContent,  DialogActions,  Button,  Stack,  TextField,Switch, FormControlLabel } from "@mui/material";
import AppSnackbars from "../generals/AppSnackbars";
import { api } from "../../api/axios";

interface Proveedor {
  id: string;
  nombre: string;
  correo?: string;
  telefono?: string;
  horarioEntrega?: string;
  descripcion?: string;
}

type Props = {
  open: boolean;
  onClose: () => void;
  isEdit: boolean;
  fetchProveedores: () => void;
  editingProveedor: Proveedor | null;
};

export function CrearEditarProveedor({
  open,
  onClose,
  isEdit,
  fetchProveedores,
  editingProveedor,
}: Props) {
  const [formData, setFormData] = useState<any>({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  useEffect(() => {
    if (isEdit && editingProveedor) {
      setFormData({ 
        nombre: editingProveedor.nombre,
        correo: editingProveedor.correo,
        telefono: editingProveedor.telefono,
        horarioEntrega: editingProveedor.horarioEntrega,
        descripcion: editingProveedor.descripcion,
      });
    }else {
      setFormData({});
    }
  }, [isEdit, editingProveedor]);

  const handleSubmit = async () => {
    if (!formData.nombre) {
      setErrorMsg("Nombre es requerido");
      return;
    }

    try {
      if (editingProveedor) {
        await api.patch(`/proveedor/${editingProveedor.id}`, formData);
        setSuccessMsg("Proveedor actualizado correctamente");
      } else {
        await api.post("/proveedor", formData);
        setSuccessMsg("Proveedor creado correctamente");
      }
      fetchProveedores();
      setFormData({});
      onClose();
      editingProveedor && setFormData({});
    } catch (error: any) {
      setErrorMsg("Error al guardar el proveedor");
    }
  };


  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { maxHeight: "90vh" } }}>
        <DialogTitle>{editingProveedor ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
        <DialogContent sx={{ pt: 2, overflowY: "auto" }}>
          <Stack spacing={2}>
            <TextField label="Nombre Empresa" fullWidth value={formData.nombre || ""} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
            <TextField label="Correo" type="correo" fullWidth value={formData.correo || ""} onChange={(e) => setFormData({ ...formData, correo: e.target.value })} />
            <TextField label="Teléfono" fullWidth value={formData.telefono || ""} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
            <TextField label="Descripción" fullWidth value={formData.descripcion || ""} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} />
            <TextField label="Horario de Entrega" fullWidth value={formData.horarioEntrega || ""} onChange={(e) => setFormData({ ...formData, horarioEntrega: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={ () => { onClose(); setFormData({}); } }>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {isEdit ? "Editar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbars successMsg={successMsg} errorMsg={errorMsg} setSuccessMsg={setSuccessMsg} setErrorMsg={setErrorMsg}/>  
    </>
  );
};
