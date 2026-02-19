import { MessageCircle } from 'lucide-react'

function AppointmentBanner() {
  return (
    <section id="agendar" className="bg-medical-blue py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2">
        <div>
          <h2 className="text-4xl font-bold text-white">Agendar Cita</h2>
          <p className="mt-5 text-base leading-relaxed text-white/90">
            Con una sólida formación académica y años de experiencia en procedimientos avanzados,
            el Dr. Victor Manrique se posiciona como una de las mejores opciones en
            gastroenterología. Especializado en endoscopia bariátrica y terapéutica, tratamientos
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
              <p className="text-lg font-bold text-white">+584127369667</p>
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
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Su nombre"
                className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-400"
              />
              <input
                type="email"
                placeholder="Su Email"
                className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-400"
              />
              <input
                type="tel"
                placeholder="Su numero de telefono"
                className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-400"
              />

              <button
                type="submit"
                className="rounded-md bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppointmentBanner
