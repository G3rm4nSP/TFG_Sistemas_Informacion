import { useEffect } from "react";
import { api } from "../api/axios";

export default function Productos() {

  useEffect(() => {
    api.get("/producto")
      .then(res => console.log(res.data))
      .catch(err => console.error(err));
  }, []);

  return <h1>Módulo Productos</h1>;
}