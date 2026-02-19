import { CheckCircle2 } from 'lucide-react'

const highlights = [
  'Médico cirujano egresado de la Universidad Rómulo Gallegos.',
  'Especialización en vías biliares en la Cruz Roja Venezolana.',
  'Entrenamientos: Balón gástrico en Medellín. Gastroplastias endoscópicas en Hermosillo y Tijuana. Inteligencia artificial en República Dominicana.',
  'Amplia experiencia en endoscopía terapéutica y diagnóstica.',
]

function About() {
  return (
    <section id="nosotros" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="mx-auto w-full max-w-sm rounded-[2rem] bg-white p-3 shadow-md ring-1 ring-slate-200/70">
          <img
            src="https://via.placeholder.com/420x620"
            alt="Dr. Victor en consulta"
            className="h-auto w-full rounded-[1.5rem] object-cover"
          />
        </div>

        <div>
          <span className="inline-flex rounded-full bg-light-blue px-4 py-1.5 text-xs font-semibold tracking-wide text-medical-blue">
            Sobre mí
          </span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Trayectoria y Experiencia</h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
            Con más de 13 años de experiencia como médico, el Dr. Victor Manrique combina tecnología avanzada y técnicas modernas para mejorar tu calidad de vida.
          </p>

          <ul className="mt-6 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <CheckCircle2 size={20} className="text-accent-green" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default About
