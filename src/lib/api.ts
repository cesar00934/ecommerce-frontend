// ============================================================================
// 1. CONFIGURACIÓN BASE
// ============================================================================
export const BASE_URL_RAW =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function joinUrl(base: string, endpoint: string) {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const e = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${b}${e}`;
}

// ============================================================================
// 2. TIPOS DE DATOS
// ============================================================================
export interface Categoria {
  id: number;
  nombre: string;
}

export interface NuevoProducto {
  nombre: string;
  descripcion: string;
  categoriaId: number | null;
  stock: number;
  precioCompra: number;
  precioVenta: number;
  codigoQR: string;
  codigoBarras: string;
  fechaVencimiento: string | null;
  imagenUrl: string | null;
}

export interface Producto extends NuevoProducto {
  id: number;
}

export type EstadoPedido =
  | "PENDIENTE"
  | "EN_PROCESO"
  | "ENVIADO"
  | "ENTREGADO"
  | "CANCELADO";

export interface Pedido {
  id: number;
  cliente: { id: number; username: string };
  vendedor: { id: number; username: string };
  total: number;
  estado: EstadoPedido;
  fecha: string;
  items: { producto: Producto; cantidad: number }[];
}

export interface NuevoPedido {
  clienteId: number;
  items: { productoId: number; cantidad: number }[];
}

// ============================================================================
// 3. HELPER PARA REQUESTS
// ============================================================================
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = joinUrl(BASE_URL_RAW, endpoint);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = new Headers(options.headers as HeadersInit);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${await res.text()}`);
  }

  return res.status === 204 ? (null as T) : res.json();
}

// ============================================================================
// 4. ENDPOINTS: CATEGORÍAS
// ============================================================================
// ============================================================================
// 4. ENDPOINTS: CATEGORÍAS (vía Supabase)
// ============================================================================
// ============================================================================
// 4. ENDPOINTS: CATEGORÍAS (vía Supabase)
// ============================================================================
import { supabase } from "@/lib/supabaseClient";

export async function getCategorias(): Promise<Categoria[]> {
   return apiFetch<Categoria[]>("/api/categorias");

}




export function addCategoria(nombre: string): Promise<Categoria> {
  return apiFetch<Categoria>("/api/categorias", {
    method: "POST",
    body: JSON.stringify({ nombre }),
  });
}

// ============================================================================
// 5. ENDPOINTS: PRODUCTOS
// ============================================================================
// lib/api.ts (o donde tengas uploadImage)
export async function uploadImage(file: File): Promise<{ fileDownloadUri: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const res = await fetch(`${BASE_URL_RAW}/api/storage/upload`, {
    method: "POST",
    headers: {
      // NO pongas Content-Type aquí (FormData lo maneja)
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: formData,
  });

  // <-- Aquí añadimos la lectura del cuerpo de error para poder ver qué pasa en el backend
  if (!res.ok) {
    const text = await res.text(); // lee cualquier JSON o texto que haya devuelto el servidor
    console.error("Upload error body:", text);
    // intenta parsear JSON para obtener mensaje más claro (opcional)
    try {
      const parsed = JSON.parse(text);
      // si el backend devolvió { error: "..."} o message, usa eso
      throw new Error(parsed.message || parsed.error || text || `Upload failed ${res.status}`);
    } catch {
      throw new Error(text || `Upload failed ${res.status}`);
    }
  }

  // éxito: parsea JSON y devuelve
  return res.json();
}


export async function addProducto(producto: NuevoProducto) {
  // Convertimos nombres camelCase a snake_case (para coincidir con la BD)
  const productoNormalizado = {
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    categoria_id: producto.categoriaId,
    stock: producto.stock,
    precio_compra: producto.precioCompra ?? 0,
    precio_venta: producto.precioVenta,
    codigo_qr: producto.codigoQR,
    codigo_barras: producto.codigoBarras,
    fecha_vencimiento: producto.fechaVencimiento,
    imagen_url: producto.imagenUrl,
  };


  // Aquí hacemos el POST a tu backend
  const nuevoProducto = await apiFetch<Producto>("/api/productos", {
    method: "POST",
    body: JSON.stringify(productoNormalizado),
  });

  return nuevoProducto;
}



// ============================================================================
// 6. ENDPOINTS: PEDIDOS
// ============================================================================
export function getPedidos(): Promise<Pedido[]> {
  return apiFetch<Pedido[]>("/api/pedidos");
}

export function getPedidoPorId(id: number): Promise<Pedido> {
  return apiFetch<Pedido>(`/api/pedidos/${id}`);
}

export function crearPedido(pedido: NuevoPedido): Promise<Pedido> {
  return apiFetch<Pedido>("/api/pedidos", {
    method: "POST",
    body: JSON.stringify(pedido),
  });
}

export function actualizarEstadoPedido(
  id: number,
  estado: EstadoPedido
): Promise<Pedido> {
  return apiFetch<Pedido>(`/api/pedidos/${id}/estado`, {
    method: "PUT",
    body: JSON.stringify({ estado }),
  });
}
