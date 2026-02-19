import { Activity, Eye, Stethoscope } from 'lucide-react'

const services = [
  {
    title: 'Endoscopia Digestiva',
    description:
      'Procedimiento diagnostico preciso para evaluar esofago, estomago y duodeno con tecnologia segura y moderna.',
    Icon: Stethoscope,
  },
  {
    title: 'Colonoscopia',
    description:
      'Estudio completo del colon para deteccion temprana y prevencion de patologias digestivas de forma oportuna.',
    Icon: Activity,
  },
  {
    title: 'Tratamiento de Gastritis',
    description:
      'Plan terapeutico personalizado para controlar sintomas, reducir inflamacion y mejorar la salud gastrointestinal.',
    Icon: Eye,
  },
  {
    title: 'Reflujo Gastroesofagico',
    description:
      'Evaluacion integral y manejo clinico para aliviar acidez, regurgitacion y proteger la mucosa esofagica.',
    Icon: Stethoscope,
  },
]

function Services() {
  return (
    <section id="servicios" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-slate-900">Servicios</h2>
      <p className="mt-3 max-w-2xl text-slate-600">
        Atencion especializada en diagnostico y tratamiento de enfermedades digestivas.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map(({ title, description, Icon }) => (
          <article
            key={title}
            className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="mb-4 inline-flex rounded-full bg-light-blue p-3 text-medical-blue">
              <Icon size={22} />
            </div>
            <h3 className="text-lg font-semibold text-medical-blue">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Services
