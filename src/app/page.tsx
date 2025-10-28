"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      router.replace("/login"); // redirige a login si no hay sesión
    } else {
      // Redirigir según rol
      switch (role) {
        case "ADMIN":
          router.replace("/admin");
          break;
        case "VENDEDOR":
          router.replace("/vendedor");
          break;
        case "CLIENTE":
          router.replace("/cliente");
          break;
        default:
          router.replace("/login");
      }
    }
  }, [router]);

}
