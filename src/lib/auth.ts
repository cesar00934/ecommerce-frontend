// lib/auth.ts
interface Credentials {
  username: string;
  password: string;
}

// Obtiene la base URL del backend según entorno
const BASE_URL_RAW = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Login de usuario: devuelve el rol y guarda el token JWT
export async function login(credentials: Credentials): Promise<string> {
  const res = await fetch(`${BASE_URL_RAW}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    throw new Error("Usuario o contraseña incorrecta");
  }

  const data: { token: string; role: string } = await res.json();

  // Guardar JWT y rol en localStorage
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);

  return data.role;
}

// Registro de usuario: no devuelve token, solo crea la cuenta
export async function register(credentials: Credentials): Promise<void> {
  const res = await fetch(`${BASE_URL_RAW}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const errMsg = await res.text();
    throw new Error(errMsg || "Error al crear cuenta");
  }
}

// Función auxiliar para obtener el token guardado
export function getToken(): string | null {
  return localStorage.getItem("token");
}

// Función auxiliar para cerrar sesión
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}

// Función para obtener el rol guardado
export function getRole(): string | null {
  return localStorage.getItem("role");
}
