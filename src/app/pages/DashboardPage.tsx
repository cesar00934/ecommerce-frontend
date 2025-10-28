import React from "react";

const DashboardPage: React.FC = () => {
  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Panel de Administración</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold">Usuarios Registrados</h2>
          <p className="text-2xl font-bold text-green-600">120</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold">Ventas del Mes</h2>
          <p className="text-2xl font-bold text-blue-600">$25,000</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold">Productos Disponibles</h2>
          <p className="text-2xl font-bold text-orange-600">75</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
