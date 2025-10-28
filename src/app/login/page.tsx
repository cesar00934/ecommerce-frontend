"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Usuario o contraseña incorrecta");
      }

      // El backend ahora devuelve un JSON con 'token' y 'roles' (una lista)
      const data = await res.json();

      // 1. Guardar el token en localStorage
      localStorage.setItem("token", data.token);

      // 2. Obtener el primer rol de la lista (o el más importante)
      // El backend de Spring Security añade el prefijo "ROLE_", lo quitamos si existe.
      const userRole = data.roles && data.roles.length > 0 
        ? data.roles[0].replace("ROLE_", "") 
        : "CLIENTE"; // Rol por defecto si no viene ninguno

      // 3. Guardar el rol principal en localStorage
      localStorage.setItem("role", userRole);

      // 4. Redirigir según el rol obtenido
      if (userRole === "ADMIN") {
        router.push("/admin");
      } else if (userRole === "VENDEDOR") {
        router.push("/vendedor");
      } else {
        router.push("/cliente");
      }

    } catch (err: any) {
      setError(err.message || "Ocurrió un error al iniciar sesión");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md space-y-6"
      >
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Iniciar Sesión
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded text-center">{error}</div>
        )}

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            required
            placeholder="Tu nombre de usuario"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            required
            placeholder="Tu contraseña"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition"
        >
          Iniciar Sesión
        </button>

        <p className="text-center text-gray-600 mt-2">
          ¿No tienes cuenta?{" "}
          <span
            onClick={() => router.push("/registro")}
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
          >
            Regístrate
          </span>
        </p>
      </form>
    </div>
  );
}
