import { Award, HeartHandshake, Microscope, ShieldCheck } from 'lucide-react'

const features = [
  {
    title: 'Tecnologia de Punta',
    description:
      'Equipamiento moderno para procedimientos seguros, eficientes y orientados a resultados confiables.',
    Icon: ShieldCheck,
  },
  {
    title: 'Experiencia Comprobada',
    description:
      'Trayectoria profesional en gastroenterologia con enfoque clinico y actualizacion medica constante.',
    Icon: Award,
  },
  {
    title: 'Diagnostico Preciso',
    description:
      'Evaluaciones especializadas para identificar con exactitud la causa de cada sintoma digestivo.',
    Icon: Microscope,
  },
  {
    title: 'Atencion Humana',
    description:
      'Acompanamiento cercano y personalizado para que cada paciente se sienta escuchado y seguro.',
    Icon: HeartHandshake,
  },
]

function Features() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-center text-3xl font-bold text-slate-900">
        Cuidado integral en Salud Digestiva
      </h2>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ title, description, Icon }) => (
          <article key={title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-light-blue text-medical-blue">
              <Icon size={30} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Features
