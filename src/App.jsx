import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

// --- 1. IMPORTACIONES DE LA WEB PÚBLICA ---
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import DoctorProfile from './components/DoctorProfile'
import AppointmentBanner from './components/AppointmentBanner'
import Commitment from './components/Commitment'
import AdvancedServices from './components/AdvancedServices'
import About from './components/About'
import Features from './components/Features'
import Testimonials from './components/Testimonials'
import ContactMap from './components/ContactMap'
import Footer from './components/Footer'
import ThankYou from './components/ThankYou' 
import NotFound from './pages/NotFound'
import SelfRegistration from './pages/SelfRegistration'

// --- 3. COMPONENTE QUE AGRUPA TODA TU PÁGINA DE INICIO ---
const Home = () => (
  <main>
    <Hero />
    <DoctorProfile />
    <div className="h-16 w-full bg-[url('/wave-divider.svg')] bg-[length:100%_100%] bg-no-repeat" />
    <AppointmentBanner />
    <Commitment />
    <AdvancedServices />
    <About />
    <Features />
    <Testimonials />
    <div className="h-16 w-full bg-[url('/wave-divider.svg')] bg-[length:100%_100%] bg-no-repeat" />
    <ContactMap />
  </main>
)

// --- 4. COMPONENTE PRINCIPAL APP ---
function App() {
  const location = useLocation()

  // NUEVO: Efecto para cambiar el título de la pestaña dinámicamente
  useEffect(() => {
    document.title = 'Dr. Víctor Manrique | Gastroenterólogo - Internista';
  }, [location]);

  // Escudo protector: Ocultar instalación PWA en la web pública
  useEffect(() => {
    const handleInstallPrompt = (e) => {
      e.preventDefault();
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      
      <Navbar />

      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<SelfRegistration />} />
        <Route path="/gracias" element={<ThankYou />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
      
    </div>
  )
}

export default App
