import { Phone } from 'lucide-react'

const serviceCards = [
  {
    number: '01.',
    title: 'Balón Gástrico',
    description: 'Un método mínimamente invasivo que ayuda a controlar el peso de manera efectiva.',
    image:
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=900',
  },
  {
    number: '02.',
    title: 'Endoscopías Diagnósticas',
    description:
      'Realizamos gastroscopías y colonoscopías para diagnósticos precisos y personalizados.',
    image:
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=900',
  },
  {
    number: '03.',
    title: 'Endoscopía Bariátrica',
    description: 'Manejo especializado de cálculos biliares y lesiones de vías pancreáticas.',
    image:
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=900',
  },
  {
    number: '04.',
    title: 'Tratamientos de Vías Biliares',
    description:
      'Especializado en cálculos biliares y lesiones de vías pancreáticas y biliares.',
    image:
      'https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?auto=format&fit=crop&q=80&w=900',
  },
  {
    number: '05.',
    title: 'Endoscopía Terapéutica',
    description: 'Polipectomías, ligadura de várices esofágicas y dilataciones esofágicas.',
    image:
      'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&q=80&w=900',
  },
  {
    number: '06.',
    title: 'Extracción de Cuerpos Extraños',
    description: 'Procedimientos para retirar objetos ingeridos de manera segura y eficaz.',
    image:
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=900',
  },
  {
    number: '07.',
    title: 'Dilataciones con Balón',
    description: 'Tratamiento especializado para pacientes con estenosis esofágica por acalasia.',
    image:
      'https://images.unsplash.com/photo-1583912267550-7ebd40218b2c?auto=format&fit=crop&q=80&w=900',
  },
  {
    number: '08.',
    title: 'Colangiopancreatografía Retrógrada Endoscópica (CPRE)',
    description: 'Diagnóstico y tratamiento de condiciones biliares y pancreáticas.',
    image:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=900',
  },
]

function AdvancedServices() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 lg:grid-cols-4">
          <article className="relative overflow-hidden bg-white p-10 lg:col-span-2">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage: 'radial-gradient(#cbd5e1 1.3px, transparent 1.3px)',
                backgroundSize: '12px 12px',
              }}
            />
            <div className="relative z-10">
              <h2 className="text-4xl font-extrabold leading-tight text-gray-900">
                Gastroenterología Avanzada para Tu Salud Digestiva
              </h2>
              <p className="mt-5 text-base text-gray-600">
                Todos los Servicios que Necesitas en Un Solo Lugar
              </p>
            </div>
          </article>

          {serviceCards.map((card) => (
            <article key={card.number} className="relative h-80 overflow-hidden">
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[#2a3b5c]/80" />
              <div className="relative z-10 flex h-full flex-col justify-start p-6 text-white">
                <p className="text-sm font-semibold text-white/90">{card.number}</p>
                <h3 className="mt-2 text-xl font-bold leading-tight">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/90">{card.description}</p>
              </div>
            </article>
          ))}

          <article className="flex flex-col justify-center bg-blue-500 p-10 text-white lg:col-span-2 lg:rounded-br-[4rem]">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-white/90">
              <Phone size={15} />
              <span>MÁS INFORMACIÓN Y AGENDAR TU CITA</span>
            </p>
            <p className="mt-4 text-3xl font-extrabold">04127369667</p>
          </article>
        </div>
      </div>
    </section>
  )
}

export default AdvancedServices
