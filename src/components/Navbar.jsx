import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)

  const navLinks = [
    { label: 'Inicio', href: '/#inicio' },
    { label: 'Perfil del doctor', href: '/#nosotros' },
    { label: 'Servicios', href: '/#servicios' },
    { label: 'Opiniones', href: '/#opiniones' },
    { label: 'Contacto', href: '/#contacto' },
  ]

  useEffect(() => {
    const onScroll = () => {
      setHasScrolled(window.scrollY > window.innerHeight * 0.7)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navTextClass = hasScrolled ? 'text-medical-blue' : 'text-white'
  const headerClass = hasScrolled ? 'bg-white shadow-sm' : 'bg-transparent'
  const mobileMenuClass = hasScrolled
    ? 'border-slate-200 bg-white'
    : 'border-white/20 bg-medical-blue/95 backdrop-blur-sm'
  const logoSubTextClass = hasScrolled ? 'text-slate-500' : 'text-white/80'
  const whatsappButtonClass = hasScrolled
    ? 'border-medical-blue/30 bg-medical-blue text-white'
    : 'border-white/50 bg-medical-blue text-white'

  return (
    <header className={`fixed top-0 left-0 z-50 w-full transition-colors duration-300 ${headerClass}`}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="/#inicio" className="inline-flex items-center gap-2" aria-label="Dr. Victor">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-light-blue text-sm font-bold text-medical-blue">
            DV
          </div>
          <div className="leading-tight">
            <p className={`text-sm font-semibold ${navTextClass}`}>Dr. Victor</p>
            <p className={`text-xs ${logoSubTextClass}`}>Logo placeholder</p>
          </div>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-light-blue ${navTextClass} ${
                hasScrolled ? 'hover:text-medical-blue' : ''
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://wa.me/584127369667"
            target="_blank"
            rel="noreferrer"
            className={`rounded-md border px-4 py-2 text-sm font-semibold transition hover:brightness-95 ${whatsappButtonClass}`}
          >
            WhatsApp: 04127369667
          </a>
        </nav>

        <button
          type="button"
          className={`md:hidden ${navTextClass}`}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isMobileMenuOpen ? (
        <div className={`border-t px-4 py-4 md:hidden ${mobileMenuClass}`}>
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-light-blue ${navTextClass} ${
                  hasScrolled ? 'hover:text-medical-blue' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://wa.me/584127369667"
              target="_blank"
              rel="noreferrer"
              className={`mt-2 inline-flex w-fit rounded-md border px-4 py-2 text-sm font-semibold transition hover:brightness-95 ${whatsappButtonClass}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              WhatsApp: 04127369667
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  )
}

export default Navbar
