"use client";


import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// Asegúrate de haber instalado lucide-react con 'npm install lucide-react'
import { Home, ShoppingCart, Package, BarChart, User, LogOut, Menu, X } from 'lucide-react';
import { JSX } from "react/jsx-runtime";

export default function Header() {
  const router = useRouter();
  // CORRECCIÓN 1: Especificar el tipo para el estado del rol.
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    setUserRole(null);
    router.push("/login");
  };

  // El tipado para navLinks se puede hacer más estricto si lo deseas,
  // pero TypeScript lo inferirá correctamente aquí.
  const navLinks: { [key: string]: { href: string; label: string; icon: JSX.Element }[] } = {
    CLIENTE: [
      { href: "/productos", label: "Productos", icon: <ShoppingCart className="h-5 w-5" /> },
      { href: "/pedidos", label: "Mis Pedidos", icon: <Package className="h-5 w-5" /> },
    ],
    VENDEDOR: [
      { href: "/productos", label: "Productos", icon: <ShoppingCart className="h-5 w-5" /> },
      { href: "/pedidos", label: "Gestionar Pedidos", icon: <Package className="h-5 w-5" /> },
      { href: "/inventario", label: "Inventario", icon: <BarChart className="h-5 w-5" /> },
    ],
    ADMIN: [
      { href: "/dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
      { href: "/productos", label: "Productos", icon: <ShoppingCart className="h-5 w-5" /> },
      { href: "/pedidos", label: "Pedidos", icon: <Package className="h-5 w-5" /> },
      { href: "/inventario", label: "Inventario", icon: <BarChart className="h-5 w-5" /> },
      { href: "/usuarios", label: "Usuarios", icon: <User className="h-5 w-5" /> },
    ],
  };

  // userRole puede ser null, así que usamos un array vacío como fallback.
  const allowedLinks = userRole ? navLinks[userRole] || [] : [];

  if (!userRole) {
    return null;
  }

  const renderNavLinks = (isMobile = false) => (
    allowedLinks.map((link) => (
      <Link key={link.href} href={link.href}>
        <span className={`flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors ${isMobile ? 'text-lg' : 'text-sm font-medium'}`}>
          {link.icon}
          {link.label}
        </span>
      </Link>
    ))
  );

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/">
              <span className="text-2xl font-bold text-gray-800">MiEcommerce</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            {renderNavLinks()}
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <User className="h-6 w-6" />
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                  <Link href="/perfil">
                    <span className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <User className="h-5 w-5" /> Mi Perfil
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-5 w-5 text-red-500" />
                    <span className="text-red-500">Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-200 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="flex flex-col p-4 space-y-2">
            {renderNavLinks(true)}
          </nav>
        </div>
      )}
    </header>
  );
}
