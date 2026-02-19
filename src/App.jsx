import { BrowserRouter, Route, Routes } from 'react-router-dom'
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
import CookiePolicy from './pages/CookiePolicy'

function Home() {
  return (
    <main>
      <Hero />
      <DoctorProfile />
      <div className="h-16 w-full bg-[url('/wave-divider.svg')] bg-[length:100%_100%] bg-no-repeat" />
      <AppointmentBanner />
      <Commitment />
      <AdvancedServices />
      <About />
      <Features />
      <section id="opiniones">
        <Testimonials />
      </section>
      <div className="h-16 w-full bg-[url('/wave-divider.svg')] bg-[length:100%_100%] bg-no-repeat" />
      <ContactMap />
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
