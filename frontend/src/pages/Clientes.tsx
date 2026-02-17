import { useEffect } from "react";
import { api } from "../api/axios";

export default function Clientes() {

  useEffect(() => {
    api.get("/cliente")
      .then(res => console.log(res.data))
      .catch(err => console.error(err));
  }, []);

  return <h1>Módulo Clientes</h1>;
}