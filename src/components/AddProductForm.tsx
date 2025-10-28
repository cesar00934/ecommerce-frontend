"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Inicializa Supabase (configura tus variables de entorno)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface ProductoData {
  nombre: string;
  categoria: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  fechaVencimiento: string;
  imagen: File | null;
}

export default function AddProductForm() {
  const [producto, setProducto] = useState<ProductoData>({
    nombre: "",
    categoria: "",
    precioCompra: 0,
    precioVenta: 0,
    stock: 0,
    fechaVencimiento: "",
    imagen: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProducto(prev => ({
      ...prev,
      [name]: name.includes("precio") || name === "stock" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProducto(prev => ({ ...prev, imagen: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let imageUrl = "";

      // Subir imagen a Supabase
      if (producto.imagen) {
        const fileExt = producto.imagen.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from("productos")
          .upload(fileName, producto.imagen);

        if (uploadError) throw uploadError;
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos/${fileName}`;
      }

      // Enviar al backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/productos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...producto, imagen: imageUrl }),
      });

      if (!res.ok) throw new Error("Error al guardar producto");

      setSuccess("Producto agregado correctamente");
      setProducto({
        nombre: "",
        categoria: "",
        precioCompra: 0,
        precioVenta: 0,
        stock: 0,
        fechaVencimiento: "",
        imagen: null,
      });
    } catch (err: any) {
      setError(err.message || "Error al agregar producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Agregar Producto</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-2">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-2">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={producto.nombre}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Categoría</label>
          <input
            type="text"
            name="categoria"
            value={producto.categoria}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold">Precio Compra</label>
            <input
              type="number"
              name="precioCompra"
              value={producto.precioCompra}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              min={0}
            />
          </div>
          <div>
            <label className="block font-semibold">Precio Venta</label>
            <input
              type="number"
              name="precioVenta"
              value={producto.precioVenta}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              min={0}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold">Stock</label>
            <input
              type="number"
              name="stock"
              value={producto.stock}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              min={0}
            />
          </div>
          <div>
            <label className="block font-semibold">Fecha Vencimiento</label>
            <input
              type="date"
              name="fechaVencimiento"
              value={producto.fechaVencimiento}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <div>
          <label className="block font-semibold">Imagen</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Guardando..." : "Agregar Producto"}
        </button>
      </form>
    </div>
  );
}
