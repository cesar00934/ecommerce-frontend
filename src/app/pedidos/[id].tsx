"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPedidoPorId } from "../../lib/api";

export default function PedidoDetalle() {
  const params = useParams();
  const [pedido, setPedido] = useState<any>(null);

  useEffect(() => {
    if (!params.id) return;
    getPedidoPorId(Number(params.id)).then(setPedido);
  }, [params.id]);

  if (!pedido) return <div>Cargando...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Detalle del Pedido #{pedido.id}</h2>
      <p>Cliente: {pedido.cliente}</p>
      <p>Vendedor: {pedido.vendedor}</p>
      <p>Total: S/ {pedido.total}</p>
      <button className="mt-4 bg-green-600 text-white p-2 rounded" onClick={() => alert("Descargando boleta...")}>Descargar Boleta</button>
    </div>
  );
}
