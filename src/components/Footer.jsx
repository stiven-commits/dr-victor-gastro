import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react'

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <a href="#inicio" className="inline-flex items-center gap-2" aria-label="Dr. Victor">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-medical-blue/20 text-sm font-bold text-light-blue">
              DV
            </div>
            <p className="text-base font-semibold text-white">Dr. Victor</p>
          </a>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
            Atencion especializada en gastroenterologia y endoscopia digestiva con enfoque humano,
            etico y orientado a un diagnostico preciso.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://www.facebook.com/drvictorgastro"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="rounded-full bg-slate-900 p-2 text-slate-200 transition hover:bg-medical-blue hover:text-white"
            >
              <Facebook size={18} />
            </a>
            <a
              href="https://www.instagram.com/drvictorgastro/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-full bg-slate-900 p-2 text-slate-200 transition hover:bg-medical-blue hover:text-white"
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold text-white">Enlaces Rapidos</h3>
          <nav className="mt-4 flex flex-col gap-3 text-sm">
            <a href="#servicios" className="transition hover:text-medical-blue">
              Servicios
            </a>
            <a href="#faq" className="transition hover:text-medical-blue">
              Preguntas Frecuentes
            </a>
          </nav>
        </div>

        <div>
          <h3 className="text-base font-semibold text-white">Contacto</h3>
          <div className="mt-4 space-y-3 text-sm">
            <p className="flex items-start gap-3">
              <MapPin size={17} className="mt-0.5 text-medical-blue" />
              <span>Av. Principal 123, Consultorio 4B, Ciudad</span>
            </p>
            <a
              href="https://wa.me/584127369667"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 transition hover:text-medical-blue"
            >
              <Phone size={17} className="text-medical-blue" />
              <span>+58 412 7369667</span>
            </a>
            <a
              href="mailto:contacto@drvictor.com"
              className="flex items-center gap-3 transition hover:text-medical-blue"
            >
              <Mail size={17} className="text-medical-blue" />
              <span>contacto@drvictor.com</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Dr. Victor. Diseñado para Dr. Víctor.
        </p>
      </div>
    </footer>
  )
}

export default Footer
