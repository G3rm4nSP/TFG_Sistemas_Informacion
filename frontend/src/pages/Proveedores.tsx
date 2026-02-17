import { useEffect } from "react";
import { api } from "../api/axios";

export default function Proveedores() {

  useEffect(() => {
    api.get("/proveedor")
      .then(res => console.log(res.data))
      .catch(err => console.error(err));
  }, []);

  return <h1>Módulo Proveedores</h1>;
}