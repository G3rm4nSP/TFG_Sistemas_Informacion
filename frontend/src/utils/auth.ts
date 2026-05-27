export function decodeToken(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function getUserFromToken() {
  const token = localStorage.getItem("accessToken");

  if (!token) return null;

  return decodeToken(token);
}