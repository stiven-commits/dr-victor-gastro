function Commitment() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2">
        <div className="relative">
          <div
            className="absolute -top-8 -left-8 z-0 h-28 w-28 text-gray-200"
            aria-hidden="true"
            style={{
              backgroundImage: 'radial-gradient(currentColor 1.4px, transparent 1.4px)',
              backgroundSize: '10px 10px',
            }}
          />

          <img
            src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=500"
            alt="Atencion medica especializada"
            className="relative z-10 h-[420px] w-[80%] rounded-2xl object-cover shadow-lg"
          />

          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400"
            alt="Procedimiento medico digestivo"
            className="absolute -right-4 -bottom-10 w-2/3 rounded-2xl border-8 border-white object-cover shadow-xl"
          />
        </div>

        <div>
          <h2 className="mb-4 text-4xl font-extrabold text-gray-900">
            Comprometidos con la Salud Digestiva
          </h2>
          <p className="mb-4 text-lg font-bold text-gray-800">Tu Bienestar, Nuestra Prioridad</p>

          <div className="space-y-4 text-gray-600">
            <p>
              El Dr. Victor Manrique trabaja con una vision integral, combinando experiencia
              clinica y tecnologia de ultima generacion para identificar con precision el origen de
              cada sintoma digestivo.
            </p>
            <p>
              Cada tratamiento se diseña de forma personalizada, con seguimiento cercano y un trato
              humano que brinda confianza en cada etapa del proceso, priorizando resultados
              efectivos y una mejor calidad de vida.
            </p>
          </div>

          <a
            href="#nosotros"
            className="mt-6 inline-flex rounded-md border border-medical-blue px-5 py-3 text-sm font-semibold text-medical-blue transition hover:bg-medical-blue hover:text-white"
          >
            Conoce mas sobre el Dr. Victor
          </a>
        </div>
      </div>
    </section>
  )
}

export default Commitment
