import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Empleados from "./pages/Empleados";
import Clientes from "./pages/Clientes";
import Productos from "./pages/Productos";
import Proveedores from "./pages/Proveedores"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/empleados" element={<Empleados />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/proveedores" element={<Proveedores />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;