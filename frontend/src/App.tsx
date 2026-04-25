import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Empleados from "./pages/Empleados";
import Clientes from "./pages/Clientes";
import Productos from "./pages/Productos";
import Proveedores from "./pages/Proveedores"
import PedidoProveedor from "./pages/PedidoProveedor";
import Ventas from "./pages/Ventas"
import ListaDashboards from "./pages/ListaDashboards"
import DashboardVentas from "./pages/DashboardVentas"
import DashboardGeneral from "./pages/DashboardGeneral"
import DashboardStock from "./pages/DashboardStock"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/empleados" element={<Empleados />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/ventas" element={<Ventas />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/proveedores/:provId" element={<PedidoProveedor />} />
        <Route path="/listaDashboards" element={<ListaDashboards/>} />
        <Route path="/listaDashboards/DashboardVentas" element={<DashboardVentas/>} />
        <Route path="/listaDashboards/DashboardGeneral" element={<DashboardGeneral/>} />
        <Route path="/listaDashboards/DashboardStock" element={<DashboardStock/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;