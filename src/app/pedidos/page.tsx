"use client";
import { useEffect, useState } from "react";
import { getPedidos } from "../../lib/api";
import { Search, Package, User, Calendar, MoreHorizontal, Loader2, AlertCircle } from "lucide-react"; // Iconos para mejorar la UI

// Definimos un tipo para los pedidos para tener autocompletado y seguridad de tipos
type Pedido = {
  id: number;
  cliente: string; // Asumo que son strings, si son objetos, hay que ajustar el tipo
  vendedor: string;
  total: number;
  estado: 'PENDIENTE' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO'; // Ejemplo de estados
  fecha: string; // Ejemplo: '2025-10-13'
};

// Componente para mostrar un estado de carga
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-10">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <p className="ml-4 text-lg text-gray-600">Cargando pedidos...</p>
  </div>
);

// Componente para mostrar cuando no hay resultados
const EmptyState = () => (
  <div className="text-center p-10 border-2 border-dashed rounded-lg">
    <Package className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-lg font-medium text-gray-900">No se encontraron pedidos</h3>
    <p className="mt-1 text-sm text-gray-500">Intenta ajustar los filtros o revisa más tarde.</p>
  </div>
);

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsLoading(true);
    getPedidos()
      .then((data) => {
        // Asumo que la API devuelve los datos como los necesitas.
        // Si no, aquí puedes mapearlos al tipo 'Pedido'.
        setPedidos(data);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudieron cargar los pedidos. Inténtalo de nuevo más tarde.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Lógica de filtrado por término de búsqueda
  const filteredPedidos = pedidos.filter(p =>
    p.id.toString().includes(searchTerm) ||
    p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vendedor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para obtener un color según el estado del pedido
  const getStatusBadge = (estado: Pedido['estado']) => {
    const styles = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      ENVIADO: 'bg-blue-100 text-blue-800',
      ENTREGADO: 'bg-green-100 text-green-800',
      CANCELADO: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[estado]}`}>
        {estado}
      </span>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-red-50 rounded-lg">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium text-red-800">Ocurrió un error</h3>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <p className="mt-1 text-md text-gray-600">Busca, filtra y administra todos los pedidos registrados.</p>
        </header>

        {/* Barra de Búsqueda y Filtros */}
        <div className="mb-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por ID, cliente o vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
            />
          </div>
        </div>

        {/* Contenedor de la Tabla */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {filteredPedidos.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pedido</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPedidos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{p.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.cliente}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.vendedor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(p.fecha).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(p.estado)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-800">S/ {p.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href={`/pedidos/${p.id}`} className="text-blue-600 hover:text-blue-900">
                        Ver Detalles
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
