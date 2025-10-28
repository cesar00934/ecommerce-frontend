// app/admin/page.tsx (versión simplificada para mostrar el enlace)
"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { PackagePlus, Users } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute roleRequired="ADMIN">
      <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Panel de Administración</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Tarjeta para ir a Gestión de Usuarios */}
          <Link href="/admin/usuarios" className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <Users className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Gestión de Usuarios</h2>
              <p className="text-gray-600">Crear, editar y eliminar usuarios.</p>
            </div>
          </Link>

          {/* Tarjeta para ir a Gestión de Productos */}
          <Link href="/admin/productos/nuevo" className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <PackagePlus className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Gestión de Productos</h2>
              <p className="text-gray-600">Ver, añadir y editar productos.</p>
            </div>
          </Link>

          {/* Puedes añadir más tarjetas aquí para Pedidos, Estadísticas, etc. */}

        </div>
      </div>
    </ProtectedRoute>
  );
}
