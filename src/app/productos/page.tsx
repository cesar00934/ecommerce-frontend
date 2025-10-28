"use client";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { ShoppingCart, Loader2, AlertCircle, Search, X } from "lucide-react";

interface Producto {
  id: number;
  nombre: string;
  precio_venta: number;
  imagen_url?: string;
  descripcion?: string;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrecio, setMinPrecio] = useState("");
  const [maxPrecio, setMaxPrecio] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchProductos = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("products")
        .select("id, nombre, precio_venta, imagen_url, descripcion")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching productos:", error);
        setError("No se pudieron cargar los productos.");
      } else {
        setProductos(data || []);
      }
      setIsLoading(false);
    };

    fetchProductos();
  }, [supabase]);

  // 🔍 Filtrado por nombre y rango de precios (sin perder rendimiento)
  const filtered = useMemo(() => {
    return productos.filter((p) => {
      const nombreMatch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const precio = p.precio_venta || 0;
      const min = minPrecio ? parseFloat(minPrecio) : 0;
      const max = maxPrecio ? parseFloat(maxPrecio) : Infinity;
      return nombreMatch && precio >= min && precio <= max;
    });
  }, [productos, searchTerm, minPrecio, maxPrecio]);

  const handleAddToCart = (producto: Producto) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({ ...producto, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`🛒 "${producto.nombre}" agregado al carrito`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        <p className="ml-3 text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Productos</h1>
            <p className="text-gray-600 mt-1">
              Explora todos los productos disponibles.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center bg-white p-3 rounded-lg shadow">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <input
              type="number"
              placeholder="Precio mín"
              value={minPrecio}
              onChange={(e) => setMinPrecio(e.target.value)}
              className="w-24 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Precio máx"
              value={maxPrecio}
              onChange={(e) => setMaxPrecio(e.target.value)}
              className="w-24 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />

            {(searchTerm || minPrecio || maxPrecio) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setMinPrecio("");
                  setMaxPrecio("");
                }}
                className="flex items-center gap-1 text-red-600 hover:text-red-800"
              >
                <X size={16} /> Limpiar
              </button>
            )}
          </div>
        </header>

        {filtered.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">
              No se encontraron productos con esos filtros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
              >
                <div className="relative w-full h-52 bg-gray-100">
                  {producto.imagen_url ? (
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex justify-center items-center h-full text-gray-400">
                      <span>Sin imagen</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col justify-between h-44">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {producto.nombre}
                    </h3>
                    {producto.descripcion && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {producto.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-blue-600 font-bold text-lg">
  {producto.precio_venta == null ? "—" : `S/ ${producto.precio_venta.toFixed(2)}`}
                    </span>
                    <button
                      onClick={() => handleAddToCart(producto)}
                      className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
                    >
                      <ShoppingCart size={18} /> Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
