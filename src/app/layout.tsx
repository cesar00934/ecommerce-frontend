
"use client";

import React from "react";
import { usePathname } from "next/navigation"; // ✅ Import correcto
import Header from "../components/Header"; // Ajusta ruta si es necesario
import "@/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // ✅ Ya no dará error

  const hideHeaderRoutes = ["/login", "/register"];

  return (
    <html lang="es">
      <body>
        {!hideHeaderRoutes.includes(pathname) && <Header />}
        <main>{children}</main>
      </body>
    </html>
  );
}
