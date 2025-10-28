"use client";
import React, { useState } from "react";
import QRScanner from "./QRScanner";
import { crearPedido } from "../lib/api";

export default function PedidoForm() {
  const [cliente, setCliente] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [productos, setProductos] = useState([{ nombre: "", cantidad: 1 }]);

  const handleProductoChange = (index: number, value: string) => {
    const newProductos = [...productos];
    newProductos[index].nombre = value;
    setProductos(newProductos);
  };

  const handleCantidadChange = (index: number, value: number) => {
    const newProductos = [...productos];
    newProductos[index].cantidad = value;
    setProductos(newProductos);
  };

  const addProducto = () => {
    setProductos([...productos, { nombre: "", cantidad: 1 }]);
  };

  const handleScan = (result: string) => {
    // Puedes agregar lógica para buscar el producto escaneado
    setProductos([{ nombre: result, cantidad: 1 }]);
    alert("Producto escaneado: " + result);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const pedido = { cliente, vendedor, productos, total: productos.reduce((a,b)=>a+b.cantidad*10,0) };
    await crearPedido(pedido);
    alert("Pedido registrado!");
    setCliente(""); setVendedor(""); setProductos([{ nombre: "", cantidad: 1 }]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded">
      <div>
        <label className="block font-semibold">Cliente:</label>
        <input value={cliente} onChange={(e) => setCliente(e.target.value)} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block font-semibold">Vendedor:</label>
        <input value={vendedor} onChange={(e) => setVendedor(e.target.value)} className="w-full p-2 border rounded" />
      </div>

      <div>
        <label className="block font-semibold">Productos:</label>
        {productos.map((p, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              placeholder="Nombre"
              value={p.nombre}
              onChange={(e) => handleProductoChange(i, e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <input
              type="number"
              value={p.cantidad}
              onChange={(e) => handleCantidadChange(i, Number(e.target.value))}
              className="w-20 p-2 border rounded"
            />
          </div>
        ))}
        <button type="button" onClick={addProducto} className="bg-blue-600 text-white px-4 py-2 rounded">
          + Agregar producto
        </button>
      </div>

      <div>
        <label className="block font-semibold">Escanear producto:</label>
        <QRScanner onScan={handleScan} />
      </div>

      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded mt-4">
        Registrar Pedido
      </button>
    </form>
  );
}
