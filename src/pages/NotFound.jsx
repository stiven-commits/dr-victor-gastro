import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Stethoscope } from 'lucide-react';
import logo from '../assets/logo-dr-victor-horizontal-300x66.png';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      {/* Logo superior */}
      <Link to="/" className="mb-8 hover:opacity-80 transition-opacity">
        <img src={logo} alt="Dr. Víctor Logo" className="h-10 md:h-12 w-auto object-contain" />
      </Link>

      {/* Tarjeta principal */}
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full border border-gray-100 relative overflow-hidden">
        {/* Barra decorativa superior */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#0056b3]"></div>
        
        {/* Icono decorativo */}
        <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <Stethoscope className="w-12 h-12 text-[#0056b3]" />
        </div>

        <h1 className="text-7xl md:text-8xl font-black text-slate-800 mb-2 tracking-tight">404</h1>
        <h2 className="text-xl md:text-2xl font-bold text-slate-700 mb-4">Página no encontrada</h2>
        
        <p className="text-slate-500 mb-8 text-sm md:text-base leading-relaxed">
          Lo sentimos, la página que intentas buscar no existe, ha sido movida o la dirección es incorrecta.
        </p>

        {/* Botón de retorno */}
        <Link 
          to="/" 
          className="inline-flex items-center justify-center gap-2 bg-[#0056b3] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md w-full md:w-auto"
        >
          <Home className="w-5 h-5" /> Volver al Inicio
        </Link>
      </div>

      {/* Pie de página pequeño */}
      <p className="mt-8 text-xs text-slate-400">
        © {new Date().getFullYear()} Dr. Víctor - Gastroenterología Clínica
      </p>
    </div>
  );
}