import { api } from "../api/axios";
import { getUserFromToken } from "../utils/auth";

export async function fetchUsuario(navigate: any) {
  const user = getUserFromToken();
  if (!user?.sub) {
    return null;
  }

  try {
    const res = await api.get(`/usuario/${user.sub}`);
    return res.data;
  } catch (error) {
    console.error("Error cargando usuario", error);
    navigate("/login");

    return null;
  }
}

export const logout = (navigate: any) => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  navigate("/login");
};
