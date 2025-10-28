// components/ProtectedRoute.tsx (VERSIÓN CORREGIDA Y PROFESIONAL)
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

// 1. (Mejora) Componente de Carga: Es buena práctica mostrar algo al usuario mientras se verifica.
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-gray-100">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
  </div>
);

interface Props {
  roleRequired?: string | string[]; // 2. (Mejora) Permitir un array de roles para más flexibilidad.
  children: ReactNode;
}

export default function ProtectedRoute({ roleRequired, children }: Props) {
  const router = useRouter();
  
  // 3. (Corrección) Renombramos el estado para que sea más claro.
  // Empieza en 'true' porque siempre comenzamos verificando.
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    // 4. (Mejora) Lógica de verificación de rol más robusta.
    let isAuthorized = false;
    if (token && role) { // Primero, debe existir token y rol.
      if (!roleRequired) {
        // Si no se requiere un rol específico, solo estar logueado es suficiente.
        isAuthorized = true;
      } else if (Array.isArray(roleRequired)) {
        // Si es un array de roles, comprobamos si el rol del usuario está en la lista.
        isAuthorized = roleRequired.includes(role);
      } else {
        // Si es un solo rol, comparamos directamente.
        isAuthorized = role === roleRequired;
      }
    }

    // 5. (Corrección) Decidimos qué hacer DESPUÉS de la verificación.
    if (isAuthorized) {
      // Si está autorizado, dejamos de verificar y permitimos que se muestre el contenido.
      setIsVerifying(false);
    } else {
      // Si no está autorizado, redirigimos. No necesitamos cambiar el estado,
      // porque la redirección sacará al usuario de esta página de todos modos.
      router.push("/login");
    }
    
    // 6. (Mejora) Dependencias correctas. El efecto debe re-ejecutarse si cambia el rol requerido.
  }, [router, roleRequired]);

  // 7. (LA CORRECCIÓN MÁS IMPORTANTE) Lógica de renderizado correcta.
  if (isVerifying) {
    // Si estamos verificando, muestra la pantalla de carga. NO el contenido.
    return <LoadingSpinner />;
  }

  // Si 'isVerifying' es 'false', significa que la verificación fue exitosa
  // y podemos mostrar el contenido de forma segura.
  return <>{children}</>;
}
