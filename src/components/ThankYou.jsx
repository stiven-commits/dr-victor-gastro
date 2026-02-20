import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

function ThankYou() {
  useEffect(() => {
    // Disparar el evento 'Lead' de Meta Pixel cuando cargue la página
    if (window.fbq) {
      window.fbq('track', 'Lead');
    }
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <CheckCircle className="mb-6 h-20 w-20 text-green-500" />
      <h1 className="mb-4 text-4xl font-bold text-[#0056b3]">¡Solicitud enviada con éxito!</h1>
      <p className="mb-8 max-w-lg text-lg text-slate-600">
        Gracias por confiar en el Dr. Víctor Manrique. Hemos recibido tus datos correctamente y nuestro equipo se pondrá en contacto contigo a la brevedad posible para agendar tu cita.
      </p>
      <Link 
        to="/" 
        className="rounded-md bg-[#0056b3] px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

export default ThankYou;