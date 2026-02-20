import { CalendarDays } from 'lucide-react'
import heroBg from '../assets/MG_3894-2-1024x710.jpg'

function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="absolute inset-0 bg-medical-blue/80" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 pb-32 text-center sm:px-6 lg:px-8 lg:pb-48">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Especialista en endoscopía bariátrica, terapéutica
          </h1>
          <p className="mt-4 text-xl text-white sm:text-2xl">y colocación de balón gástrico.</p>
          <a
            href="#agendar"
            className="mx-auto mt-8 inline-flex items-center gap-2 rounded-lg bg-accent-green px-7 py-3 text-sm font-semibold text-white transition hover:brightness-95"
          >
            <CalendarDays size={18} />
            <span>Agendar Cita</span>
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 z-20 w-full leading-none">
        <svg
          viewBox="0 0 1440 320"
          className="h-auto w-full"
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          <path fill="#ffffff" d="M0,160 C480,320 960,320 1440,160 L1440,320 L0,320 Z" />
        </svg>
      </div>
    </section>
  )
}

export default Hero
