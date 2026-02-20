import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react'
import logoWhite from '../assets/logo-dr-victor-h-blanco-2.png';
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <a href="#inicio" className="inline-flex items-center gap-2" aria-label="Dr. Victor">
            <img src={logoWhite} alt="Logo Dr. Víctor Manrique" className="h-12 w-auto object-contain" />
          </a>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
            Atención especializada en gastroenterología y endoscopia digestiva con enfoque humano,
            ético y orientado a un diagnóstico preciso.
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
            <a href="/#inicio" className="transition hover:text-medical-blue">
              Inicio
            </a>
            <a href="/#nosotros" className="transition hover:text-medical-blue">
              Perfil del doctor
            </a>
            <a href="/#servicios" className="transition hover:text-medical-blue">
              Servicios
            </a>
            <a href="/#opiniones" className="transition hover:text-medical-blue">
              Opiniones
            </a>
            <a href="/#agendar" className="transition hover:text-medical-blue">
              Contacto
            </a>
            <Link to="/cookie-policy" className="transition hover:text-medical-blue">
              Cookie Policy
            </Link>
          </nav>
        </div>

        <div>
          <h3 className="text-base font-semibold text-white">Contacto</h3>
          <div className="mt-4 space-y-3 text-sm">
            <p className="flex items-start gap-3">
              <MapPin size={17} className="mt-0.5 text-medical-blue" />
              <span>Edif. Centro Uno, Piso 3, San Bernardino, Caracas</span>
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
              href="mailto:consulta@drvictorgastro.com"
              className="flex items-center gap-3 transition hover:text-medical-blue"
            >
              <Mail size={17} className="text-medical-blue" />
              <span>consulta@drvictorgastro.com</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Dr. Victor. Diseñado por .{' '}
          <a
            href="https://www.sosmarketing.agency"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-300 transition hover:text-white"
          >
            SOS Marketing Agency
          </a>
          .
        </p>
      </div>
    </footer>
  )
}

export default Footer
