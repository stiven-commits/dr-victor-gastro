import { useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';

function AppointmentBanner() {
  const form = useRef();
  const [status, setStatus] = useState('Enviar');

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus('Enviando...');

    // ASEGÚRATE DE CAMBIAR ESTOS 3 VALORES POR LOS TUYOS
    emailjs
      .sendForm(
        'service_nz37t1p',
        'template_u85ofjo',
        form.current,
        '2FTM0PYR2R4a0Mwye'
      )
      .then(
        (result) => {
          console.log('Éxito:', result.text);
          setStatus('¡Enviado con éxito!');
          e.target.reset(); // Limpia los campos del formulario
          setTimeout(() => setStatus('Enviar'), 3000); // Restaura el botón después de 3 seg
        },
        (error) => {
          console.log('Error:', error.text);
          setStatus('Error al enviar');
          setTimeout(() => setStatus('Enviar'), 3000);
        }
      );
  };

  return (
    <section id="agendar" className="bg-medical-blue py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2">
        <div>
          <h2 className="text-4xl font-bold text-white">Agendar Cita</h2>
          <p className="mt-5 text-base leading-relaxed text-white/90">
            Con una sólida formación académica y años de experiencia en procedimientos avanzados,
            el Dr. Victor Manrique se posiciona como una de las mejores opciones en
            gastroenterología. Especializado en endoscopía bariátrica y terapéutica, tratamientos
            de vías biliares y colocación de balón gástrico, ofrece un enfoque integral y
            personalizado para cada paciente.
          </p>

          <a
            href="https://wa.me/584127369667"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-lg border border-white/30 bg-white/10 px-4 py-3 transition hover:bg-white/20"
          >
            <MessageCircle size={24} className="text-white" />
            <div>
              <p className="text-xs font-semibold tracking-wider text-white/80">
                CONTÁCTAME POR WHATSAPP
              </p>
              <p className="text-lg font-bold text-white">04127369667</p>
            </div>
          </a>
        </div>

        <div className="relative">
          <div
            className="pointer-events-none absolute -right-6 -bottom-6 h-40 w-40 rounded-lg opacity-40"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1.6px, transparent 1.6px)',
              backgroundSize: '12px 12px',
            }}
          />

          <div className="relative z-10 rounded-lg bg-white p-8 shadow-2xl">
            <form ref={form} onSubmit={sendEmail} className="space-y-4">
              <input
                type="text"
                name="user_name"
                required
                placeholder="Su nombre"
                className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-400"
              />
              <input
                type="email"
                name="user_email"
                required
                placeholder="Su Email"
                className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-400"
              />
              <input
                type="tel"
                name="user_phone"
                required
                placeholder="Su numero de telefono"
                className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-400"
              />
              <button
                type="submit"
                disabled={status === 'Enviando...'}
                className="rounded-md bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:bg-blue-300"
              >
                {status}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AppointmentBanner;
