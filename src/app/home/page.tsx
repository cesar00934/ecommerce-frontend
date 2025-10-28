"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function HomePage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("role");
    router.push("/login");
  };

  return (
    <ProtectedRoute roleRequired="CLIENTE">
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center">Menú Principal</h1>
          
          <ul className="space-y-4 mb-6">
            <li>
              <a
                href="/productos"
                className="block text-blue-600 hover:underline text-lg font-medium"
              >
                Productos
              </a>
            </li>
            <li>
              <a
                href="/pedidos"
                className="block text-blue-600 hover:underline text-lg font-medium"
              >
                Pedidos
              </a>
            </li>
            <li>
              <a
                href="/inventario"
                className="block text-blue-600 hover:underline text-lg font-medium"
              >
                Inventario
              </a>
            </li>
            <li>
              <a
                href="/perfil"
                className="block text-blue-600 hover:underline text-lg font-medium"
              >
                Mi Perfil
              </a>
            </li>
          </ul>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition font-semibold"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
