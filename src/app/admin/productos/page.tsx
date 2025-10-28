"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Plus, Loader2 } from "lucide-react";

// Asumimos que un producto en la lista tiene al menos estas propiedades
interface ProductoEnLista {
  id: number;
  nombre: string;
  stock: number;
  precio_venta: number;
}

export default function ListaProductosPage() {
  const supabase = createClient();
  const [productos, setProductos] = useState<ProductoEnLista[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, nombre, stock, precio_venta'); // Solo pedimos los datos que necesitamos para la lista

      if (error) {
        setError("No se pudieron cargar los productos: " + error.message);
      } else {
        setProductos(data);
      }
      setIsLoading(false);
    };

    fetchProductos();
  }, [supabase]);

  return (
    <ProtectedRoute roleRequired="ADMIN">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Inventario de Productos</h1>
          {/* ESTE BOTÓN AHORA LLEVA A LA PÁGINA CORRECTA */}
          <Link href="/admin/productos/nuevo">
            <span className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
              <Plus size={20} />
              Agregar Producto
            </span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Venta</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Editar</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{producto.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{producto.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">S/ {producto.precio_venta.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href="#" className="text-indigo-600 hover:text-indigo-900">Editar</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
