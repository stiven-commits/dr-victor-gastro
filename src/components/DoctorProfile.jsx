import { ShieldPlus, Stethoscope, Target } from 'lucide-react'
import docMainImg from '../assets/MG_3867.jpg'
import docSubImg from '../assets/MG_3835.jpg'

function DoctorProfile() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2">
        <div>
          <h2 className="text-4xl font-bold text-medical-blue">Dr. Víctor</h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            Con más de 13 años de experiencia como médico, el Dr. Victor Manrique combina
            tecnología avanzada y técnicas modernas para mejorar tu calidad de vida.
          </p>

          <ul className="mt-6 space-y-6">
            <li className="flex items-start gap-3">
              <Target size={22} className="mt-1 shrink-0 text-medical-blue" />
              <div>
                <p className="font-bold text-medical-blue">Balón Gástrico</p>
                <p className="text-gray-600">Un método mínimamente invasivo para el control del peso.</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <Stethoscope size={22} className="mt-1 shrink-0 text-accent-green" />
              <div>
                <p className="font-bold text-medical-blue">Endoscopía Bariátrica</p>
                <p className="text-gray-600">Opciones avanzadas como gastroplastias y dilataciones.</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <ShieldPlus size={22} className="mt-1 shrink-0 text-medical-blue" />
              <div>
                <p className="font-bold text-medical-blue">Tratamientos de vías biliares</p>
                <p className="text-gray-600">Manejo especializado de cálculos y lesiones.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="relative">
          <img
            src={docMainImg}
            alt="Dr. Víctor en consulta"
            className="mx-auto w-11/12 sm:w-4/5 lg:w-1/2 rounded-3xl object-cover shadow-md"
          />

          <img
            src={docSubImg}
            alt="Procedimiento médico"
            className="absolute -bottom-10 -left-10 w-1/2 rounded-2xl border-8 border-white object-cover shadow-xl"
          />
        </div>
      </div>
    </section>
  )
}

export default DoctorProfile
