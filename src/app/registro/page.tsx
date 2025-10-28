"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// La interfaz no es estrictamente necesaria aquí, pero si la usas, también debería usar 'username'.
// interface RegistroData {
//   username: string;
//   password: string;
// }

export default function RegistroPage() {
  const router = useRouter();
  // 1. Cambiar el estado de 'nombre' a 'username'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Limpiar errores previos

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 2. Asegurarse de que el cuerpo de la solicitud envíe 'username' y 'password'
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        // Es una buena práctica intentar leer el mensaje de error del backend
        const errorData = await res.json().catch(() => null); // Evita error si la respuesta no es JSON
        throw new Error(errorData?.message || `Error ${res.status}: No se pudo crear el usuario`);
      }

      // Redirige al login después de un registro exitoso
      router.push("/login");

    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Registro Cliente</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded text-center">{error}</div>
        )}

        <div>
          <label className="block font-semibold">Usuario</label>
          <input
            type="text"
            // 3. Conectar el input al estado 'username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
            required
            placeholder="Elige un nombre de usuario"
          />
        </div>

        <div>
          <label className="block font-semibold">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
            placeholder="Crea una contraseña segura"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Registrarse
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          ¿Ya tienes una cuenta?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
          >
            Inicia sesión aquí
          </span>
        </p>
      </form>
    </div>
  );
}
