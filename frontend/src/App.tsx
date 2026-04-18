import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Empleados from "./pages/Empleados";
import Clientes from "./pages/Clientes";
import Productos from "./pages/Productos";
import Proveedores from "./pages/Proveedores"
import PedidoProveedor from "./pages/PedidoProveedor";
import Ventas from "./pages/Ventas"
import ListaKPIs from "./pages/ListaKPIs"
import KPIsVentas from "./pages/KPIsVentas"
import KPIsClave from "./pages/KPIsClave"

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
        <Route path="/listaKPIs" element={<ListaKPIs/>} />
        <Route path="/listaKPIs/KPIsVentas" element={<KPIsVentas/>} />
        <Route path="/listaKPIs/KPIsClave" element={<KPIsClave/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;