import { Phone } from 'lucide-react'
import img1 from '../assets/balon-150x150.jpg';
import img2 from '../assets/endoscopia-150x150.jpg';
import img3 from '../assets/dr-victor-150x150.jpg';
import img4 from '../assets/enfermera-dr-victor-150x150.jpg';
import img5 from '../assets/dr-victor-2-150x150.jpg';
import img6 from '../assets/endoscopia-2-150x150.jpg';
import img7 from '../assets/dr-victor-3-150x150.jpg';
import img8 from '../assets/anestecia-150x150.jpg';

const serviceCards = [
  {
    number: '01.',
    title: 'Balón Gástrico',
    description: 'Un método mínimamente invasivo que ayuda a controlar el peso de manera efectiva.',
    image: img1,
  },
  {
    number: '02.',
    title: 'Endoscopías Diagnósticas',
    description:
      'Realizamos gastroscopías y colonoscopías para diagnósticos precisos y personalizados.',
    image: img2,
  },
  {
    number: '03.',
    title: 'Endoscopía Bariátrica',
    description: 'Manejo especializado de cálculos biliares y lesiones de vías pancreáticas.',
    image: img3,
  },
  {
    number: '04.',
    title: 'Tratamientos de Vías Biliares',
    description:
      'Especializado en cálculos biliares y lesiones de vías pancreáticas y biliares.',
    image: img4,
  },
  {
    number: '05.',
    title: 'Endoscopía Terapéutica',
    description: 'Polipectomías, ligadura de várices esofágicas y dilataciones esofágicas.',
    image: img5,
  },
  {
    number: '06.',
    title: 'Extracción de Cuerpos Extraños',
    description: 'Procedimientos para retirar objetos ingeridos de manera segura y eficaz.',
    image: img6,
  },
  {
    number: '07.',
    title: 'Dilataciones con Balón',
    description: 'Tratamiento especializado para pacientes con estenosis esofágica por acalasia.',
    image: img7,
  },
  {
    number: '08.',
    title: 'Colangiopancreatografía Retrógrada Endoscópica (CPRE)',
    description: 'Diagnóstico y tratamiento de condiciones biliares y pancreáticas.',
    image: img8,
  },
]

function AdvancedServices() {
  return (
    <section id="servicios" className="bg-white py-20 scroll-mt-20">
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
            <p className="inline-flex items-center gap-2 text-md font-semibold tracking-wider text-white/90">
              <Phone size={15} />
              <h3>MÁS INFORMACIÓN Y AGENDAR TU CITA</h3>
            </p>
            <p className="mt-4 text-3xl font-extrabold">04127369667</p>
          </article>
        </div>
      </div>
    </section>
  )
}

export default AdvancedServices
