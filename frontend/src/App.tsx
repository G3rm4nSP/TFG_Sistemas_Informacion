import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Empleados from "./pages/Empleados";
import Clientes from "./pages/Clientes";
import Productos from "./pages/Productos";
import Proveedores from "./pages/Proveedores"
import PedidoProveedor from "./pages/PedidoProveedor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/empleados" element={<Empleados />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/proveedores/:provId" element={<PedidoProveedor />} />      </Routes>
    </BrowserRouter>
  );
}

export default App;