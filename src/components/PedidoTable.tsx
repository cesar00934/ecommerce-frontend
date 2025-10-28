"use client";
import React from "react";

interface Props {
  pedidos: any[];
}

export default function PedidoTable({ pedidos }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Cliente</th>
            <th className="px-4 py-2">Vendedor</th>
            <th className="px-4 py-2">Total</th>
            <th className="px-4 py-2">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id} className="text-center border-t border-gray-200">
              <td className="px-4 py-2">{p.id}</td>
              <td className="px-4 py-2">{p.cliente.nombre}</td>
              <td className="px-4 py-2">{p.vendedor.nombre}</td>
              <td className="px-4 py-2">S/ {p.total}</td>
              <td className="px-4 py-2">{new Date(p.fecha).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
