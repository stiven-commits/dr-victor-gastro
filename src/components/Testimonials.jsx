import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Maria Gonzalez',
    text: 'La atencion fue impecable. El Dr. Victor explico todo con claridad y resolvio mis molestias digestivas rapidamente.',
    image: 'https://via.placeholder.com/80x80',
  },
  {
    name: 'Carlos Ramirez',
    text: 'Un equipo muy profesional y humano. Me senti seguro en todo el proceso de mi endoscopia y seguimiento.',
    image: 'https://via.placeholder.com/80x80',
  },
  {
    name: 'Laura Mendoza',
    text: 'Excelente experiencia. Diagnostico oportuno, tratamiento efectivo y un trato cercano desde la primera consulta.',
    image: 'https://via.placeholder.com/80x80',
  },
  {
    name: 'Andres Paredes',
    text: 'Instalaciones modernas y puntualidad total. Recomiendo al Dr. Victor por su calidad medica y calidez.',
    image: 'https://via.placeholder.com/80x80',
  },
]

function Testimonials() {
  return (
    <section id="opiniones" className="bg-medical-blue py-16 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-white">Lo que dicen nuestros pacientes</h2>

        <div className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="w-[85%] shrink-0 snap-start rounded-2xl border border-slate-100 bg-white p-8 shadow-sm sm:w-[65%] lg:w-[calc((100%-3rem)/3)]"
            >
              <div className="mb-4 flex flex-col items-start gap-1">
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <div className="mt-1 flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} size={15} fill="currentColor" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-600">&quot;{item.text}&quot;</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
