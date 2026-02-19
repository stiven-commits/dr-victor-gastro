import Navbar from './components/Navbar'
import Hero from './components/Hero'
import DoctorProfile from './components/DoctorProfile'
import AppointmentBanner from './components/AppointmentBanner'
import Commitment from './components/Commitment'
import AdvancedServices from './components/AdvancedServices'
import About from './components/About'
import Features from './components/Features'
import Services from './components/Services'
import Testimonials from './components/Testimonials'
import ContactMap from './components/ContactMap'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main>
        <Hero />
        <DoctorProfile />
        <div className="h-16 w-full bg-[url('/wave-divider.svg')] bg-[length:100%_100%] bg-no-repeat" />
        <AppointmentBanner />
        <Commitment />
        <AdvancedServices />
        <About />
        <Features />
        <Services />
        <section id="opiniones">
          <Testimonials />
        </section>
        <div className="h-16 w-full bg-[url('/wave-divider.svg')] bg-[length:100%_100%] bg-no-repeat" />
        <ContactMap />
        <section id="cookie-policy" className="mx-auto max-w-7xl px-4 py-16 text-sm text-slate-600">
          <h2 className="text-2xl font-semibold text-slate-900">Cookie Policy</h2>
          <p className="mt-3">
            Este sitio usa cookies para mejorar la experiencia de navegacion y analizar trafico.
            Al continuar navegando, aceptas el uso de cookies conforme a nuestra politica.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default App
