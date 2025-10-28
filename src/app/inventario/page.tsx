"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Edit, X, Plus, Image as ImageIcon } from "lucide-react";
import { uploadImage as subirImagen } from "@/lib/api"; // tu función uploadImage (subirImagen)
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type ProductoResp = {
  id: number;
  nombre: string;
  descripcion: string | null;
  stock: number | null;
  precio_compra: number | null;
  precio_venta: number | null;
  codigo_qr?: string | null;
  codigo_barras?: string | null;
  fecha_vencimiento?: string | null;
  imagen_url?: string | null;
  categoria_id?: number | null;
  // campo amigable para mostrar texto de categoría
  categoria_nombre?: string | null;
};

const PAGE_SIZE = 50;

export default function InventarioPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<ProductoResp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Edit modal state
  const [editing, setEditing] = useState<ProductoResp | null>(null);
  const originalRef = useRef<ProductoResp | null>(null); // guardamos snapshot original para preservar valores
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProductos();
  }, []);

  // Normaliza productos que vengan snake_case o camelCase
  function normalizeProduct(raw: any): ProductoResp {
    const p: ProductoResp = {
      id: raw.id,
      nombre: raw.nombre ?? raw.name ?? "",
      descripcion: raw.descripcion ?? raw.description ?? null,
      stock: raw.stock ?? raw.stock ?? null,
      precio_compra: raw.precio_compra ?? raw.precioCompra ?? raw.precioCompra ?? null,
      precio_venta: raw.precio_venta ?? raw.precioVenta ?? raw.precioVenta ?? null,
      codigo_qr: raw.codigo_qr ?? raw.codigoQR ?? null,
      codigo_barras: raw.codigo_barras ?? raw.codigoBarras ?? null,
      fecha_vencimiento: raw.fecha_vencimiento ?? raw.fechaVencimiento ?? null,
      imagen_url: raw.imagen_url ?? raw.imagenUrl ?? null,
      categoria_id: raw.categoria_id ?? raw.categoriaId ?? (raw.categoria?.id ?? null),
      categoria_nombre:
        raw.categoria_nombre ??
        raw.categoriaNombre ??
        raw.categoria?.nombre ??
        raw.categoria?.name ??
        null,
    };
    return p;
  }

  async function fetchProductos() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/api/productos`);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Error ${res.status}`);
      }
      const data = await res.json();
      // normalizar cada producto
      const list = (Array.isArray(data) ? data : []).map(normalizeProduct);
      setProductos(list);
    } catch (e: any) {
      setError(e.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }

  // BUSCADOR simple: busca en nombre, categoria_nombre y compara precios numéricos si el usuario escribe número
  const filtered = productos.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    if (p.nombre?.toLowerCase().includes(q)) return true;
    if (p.categoria_nombre?.toLowerCase().includes(q)) return true;
    if (p.descripcion?.toLowerCase().includes(q)) return true;
    // buscar por precio (si el usuario puso número)
    const asNum = Number(search);
    if (!isNaN(asNum) && p.precio_venta != null && Number(p.precio_venta) === asNum) return true;
    // fecha (yyyy-mm-dd)
    if (p.fecha_vencimiento && p.fecha_vencimiento.includes(search)) return true;
    return false;
  });

  // PAGINACIÓN CLIENTE
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // --- EDIT / DELETE handlers ---
  function openEdit(p: ProductoResp) {
    const copy = { ...p };
    setEditing(copy); // copia
    originalRef.current = p; // snapshot original
    setImageFile(null);
    setImagePreview(p.imagen_url || null);
  }

  function closeEdit() {
    setEditing(null);
    originalRef.current = null;
    setImageFile(null);
    setImagePreview(null);
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    // limit file
    if (f.size > 5 * 1024 * 1024) { alert("Imagen debe ser <= 5MB"); return; }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  }

  async function handleUploadImageIfNeeded(): Promise<string | null> {
    // devuelve:
    // - null => no cambiar imagen
    // - ""   => usuario quiere quitar la imagen (frontend enviará imagen_url = null)
    // - "https://..." => URL nueva subida
    if (!imageFile) {
      // si el preview fue explicitamente borrado (imagePreview === null) pero no hay nuevo file -> quitar imagen
      if (imagePreview === null && editing && editing.imagen_url) return ""; // indica quitar
      return null; // no cambiar
    }
    try {
      setUploadingImage(true);
      const resp = await subirImagen(imageFile);
      return resp.fileDownloadUri;
    } catch (err: any) {
      alert("Error subiendo imagen: " + (err.message || err));
      return null;
    } finally {
      setUploadingImage(false);
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setIsSaving(true);
    setError(null);
    try {
      const uploadedUrl = await handleUploadImageIfNeeded();
      // ORIGINAL snapshot (para preservar valores si el usuario no los cambia)
      const original = originalRef.current;

      // manejar valores numéricos/fecha: si usuario no los cambia (null/undefined), preservamos original
      const precioVenta = editing.precio_venta != null ? Number(editing.precio_venta) : (original?.precio_venta ?? null);
      const precioCompra = editing.precio_compra != null ? Number(editing.precio_compra) : (original?.precio_compra ?? null);
      const stock = editing.stock != null ? Number(editing.stock) : (original?.stock ?? null);
      const fechaV = editing.fecha_vencimiento != null ? editing.fecha_vencimiento : (original?.fecha_vencimiento ?? null);

      // Construir payload snake_case (solo campos que queremos enviar)
      const payload: any = {
        nombre: editing.nombre ?? original?.nombre ?? "",
        descripcion: editing.descripcion != null ? editing.descripcion : original?.descripcion ?? null,
        // si categoria_nombre fue editado pero no hay id, enviamos categoría como nombre para que backend lo maneje (opcional)
        categoria_id: editing.categoria_id ?? original?.categoria_id ?? null,
        stock: stock,
        precio_compra: precioCompra,
        precio_venta: precioVenta,
        codigo_qr: editing.codigo_qr != null ? editing.codigo_qr : original?.codigo_qr ?? null,
        codigo_barras: editing.codigo_barras != null ? editing.codigo_barras : original?.codigo_barras ?? null,
        fecha_vencimiento: fechaV,
      };

      // imagen: si uploadedUrl === null -> no change
      // if uploadedUrl === "" -> user wants removal -> send imagen_url = null
      if (uploadedUrl !== null) {
        payload.imagen_url = uploadedUrl === "" ? null : uploadedUrl;
        // si había imagen previa, le decimos al backend que la borre (backend debe implementar la lógica)
        if (original?.imagen_url && uploadedUrl && uploadedUrl !== "") {
          payload.previous_image_url = original.imagen_url;
        }
      }

      // Si usuario editó solo el texto de categoría (categoria_nombre) sin id, lo incluimos para la UI/backend
      if (editing.categoria_nombre != null) {
        payload.categoria_nombre = editing.categoria_nombre;
      }

      // Headers (añadir token si existe)
      const headers: Record<string,string> = { "Content-Type": "application/json" };
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // PUT al backend
      const res = await fetch(`${BASE}/api/productos/${encodeURIComponent(editing.id)}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Error ${res.status}`);
      }

      // refrescar lista
      await fetchProductos();

      // cache-bust preview si cambió la imagen
      if (uploadedUrl && uploadedUrl !== "") {
        setImagePreview(`${uploadedUrl}?t=${Date.now()}`);
      }

      closeEdit();
    } catch (e: any) {
      setError(e.message || "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  }

  async function doDelete(prodId: number) {
    if (!confirm("¿Eliminar producto? Esto no se puede deshacer.")) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string,string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${BASE}/api/productos/${prodId}`, { method: "DELETE", headers });
      if (res.status === 404) throw new Error("Producto no encontrado.");
      if (res.status === 405) throw new Error("DELETE no permitido en backend. Añade @DeleteMapping en ProductController.");
      if (!res.ok) throw new Error(await res.text());
      // eliminar localmente para feedback rápido
      setProductos(prev => prev.filter(p => p.id !== prodId));
    } catch (e: any) {
      alert("Error deleting: " + (e.message || e));
    }
  }

  // Helpers para inputs: representamos números vacíos como ""
  function numberOrEmpty(v: number | null | undefined) {
    return v == null ? "" : String(v);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Inventario</h1>
          <p className="text-sm text-gray-600">Administración de productos — editar, eliminar, buscar y cambiar imagen</p>
        </div>
        <div className="flex gap-2">
          <input
            className="border p-2 rounded w-72"
            placeholder="Buscar por nombre, categoría, precio o fecha..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <button onClick={() => router.push("/admin/productos/nuevo")} className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2">
            <Plus size={16} /> Nuevo
          </button>
        </div>
      </header>

      {loading ? (
        <div className="text-center p-8"><Loader2 className="animate-spin mx-auto" /><p>Cargando...</p></div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs">#</th>
                  <th className="px-4 py-2 text-left text-xs">Imagen</th>
                  <th className="px-4 py-2 text-left text-xs">Nombre</th>
                  <th className="px-4 py-2 text-left text-xs">Categoría</th>
                  <th className="px-4 py-2 text-right text-xs">Precio venta</th>
                  <th className="px-4 py-2 text-right text-xs">Precio compra</th>
                  <th className="px-4 py-2 text-right text-xs">Stock</th>
                  <th className="px-4 py-2 text-left text-xs">Vence</th>
                  <th className="px-4 py-2 text-right text-xs">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pageItems.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-sm">#{p.id}</td>
                    <td className="px-4 py-3">
                      {p.imagen_url ? (
                        <img src={p.imagen_url} alt={p.nombre} className="w-16 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                          <ImageIcon />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{p.nombre}</td>
                    <td className="px-4 py-3 text-sm">{p.categoria_nombre ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-right">S/ { (p.precio_venta ?? 0).toFixed(2) }</td>
                    <td className="px-4 py-3 text-sm text-right">S/ { (p.precio_compra ?? 0).toFixed(2) }</td>
                    <td className="px-4 py-3 text-sm text-right">{p.stock ?? 0}</td>
                    <td className="px-4 py-3 text-sm">{p.fecha_vencimiento ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="inline-flex gap-2">
                        <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                          <Edit size={16} /> Edit
                        </button>
                        <button onClick={() => doDelete(p.id)} className="text-red-600 hover:text-red-900 flex items-center gap-1">
                          <Trash2 size={16} /> Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Página {page} de {totalPages} — {filtered.length} resultados</div>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Anterior</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        </>
      )}

      {/* --- EDIT MODAL --- */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Editar producto #{editing.id}</h2>
              <button onClick={closeEdit}><X /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <input className="w-full border p-2 rounded" value={editing.nombre ?? ""} onChange={(e) => setEditing({ ...editing, nombre: e.target.value })} />
              </div>

          

<div>
  <label className="text-sm font-medium">Categoría </label>
  <input
    className="w-full border p-2 rounded"
    value={editing.categoria_nombre ?? ""}
    onChange={(e) => {
      // Al editar el nombre, rompemos la referencia al ID original.
      // El backend ahora usará el nombre para buscar o crear la categoría.
      setEditing(prev => ({
        ...prev!,
        categoria_nombre: e.target.value,
        categoria_id: null // <-- ¡Añade esta línea!
      }));
    }}
  />
  <small className="text-xs text-gray-500">
    Si la categoría no existe, se creará una nueva.
  </small>
</div>

              <div>
                <label className="text-sm font-medium">Precio Venta (S/)</label>
                <input
                  className="w-full border p-2 rounded"
                  type="number"
                  step="0.01"
                  value={numberOrEmpty(editing.precio_venta)}
                  onChange={(e) => setEditing({ ...editing, precio_venta: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Precio Compra (S/)</label>
                <input
                  className="w-full border p-2 rounded"
                  type="number"
                  step="0.01"
                  value={numberOrEmpty(editing.precio_compra)}
                  onChange={(e) => setEditing({ ...editing, precio_compra: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Stock</label>
                <input className="w-full border p-2 rounded" type="number" value={numberOrEmpty(editing.stock)} onChange={(e) => setEditing({ ...editing, stock: e.target.value === "" ? null : Number(e.target.value) })} />
              </div>

              <div>
                <label className="text-sm font-medium">Fecha Vencimiento</label>
                <input className="w-full border p-2 rounded" type="date" value={editing.fecha_vencimiento ?? ""} onChange={(e) => setEditing({ ...editing, fecha_vencimiento: e.target.value ?? null })} />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Descripción</label>
                <textarea className="w-full border p-2 rounded" rows={3} value={editing.descripcion ?? ""} onChange={(e) => setEditing({ ...editing, descripcion: e.target.value })} />
              </div>

              <div className="flex items-center gap-4">
                <div className="w-28 h-28 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : (editing.imagen_url ? <img src={editing.imagen_url} className="w-full h-full object-cover" /> : <ImageIcon />)}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border rounded">
                    <input type="file" accept="image/*" className="sr-only" onChange={handleImagePick} />
                    {uploadingImage ? <Loader2 className="animate-spin" /> : <span>{imageFile ? "Cambiar imagen" : "Subir imagen"}</span>}
                  </label>
                  <button className="text-sm text-red-600" onClick={() => { setImageFile(null); setImagePreview(null); /* clearing indicates removal on save */ }}>
                    Quitar imagen
                  </button>
                  <small className="text-xs text-gray-500">PNG/JPG/WEBP hasta 5MB.</small>
                </div>
              </div>

            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={closeEdit} className="px-4 py-2 border rounded">Cancelar</button>
              <button onClick={saveEdit} disabled={isSaving} className="px-4 py-2 bg-green-600 text-white rounded">
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
