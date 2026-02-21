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
import ThankYou from './components/ThankYou' // Nuestra página de gracias para el Pixel

// --- 2. IMPORTACIONES DEL CRM (ADMINISTRADOR) ---
import Login from './admin/Login'
import Dashboard from './admin/Dashboard'
import RequireAuth from './admin/RequireAuth'

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
  
  // Detectamos si la URL contiene "login" o "dashboard"
  const isAdminRoute = location.pathname.includes('/login') || location.pathname.includes('/dashboard')

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* Si NO estamos en el CRM, mostramos el menú público */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/gracias" element={<ThankYou />} />

        {/* Rutas Privadas (CRM) */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        } />
      </Routes>

      {/* Si NO estamos en el CRM, mostramos el footer público */}
      {!isAdminRoute && <Footer />}
      
    </div>
  )
}

export default App