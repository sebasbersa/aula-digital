'use client';
// /app/page.jsx

import { redirect } from "next/navigation";

const InactiveAccountPage = () => {
    const handleVolverClick = () => {
        redirect('/select-profile');
    }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">
          Cuenta Inactiva
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Tu cuenta ha sido pausada, entra con el perfil propietario y reactiva tu cuenta
        </p>
        <button
          className="mt-8 rounded-lg bg-teal-500 px-6 py-3 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75"
        onClick={handleVolverClick}
        >
          Volver Atrás
        </button>
      </div>
    </div>
  );
};

export default InactiveAccountPage;