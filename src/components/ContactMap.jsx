import { Clock3, Mail, MapPin, Phone } from 'lucide-react'

function ContactMap() {
  return (
    <section id="contacto" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Como llegar al consultorio</h2>
          <p className="mt-3 text-slate-600">
            Estamos ubicados en una zona de facil acceso, con atencion programada y soporte para
            resolver tus dudas antes de la consulta.
          </p>

          <div className="mt-8 space-y-5">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 text-medical-blue" size={20} />
              <div>
                <p className="text-sm font-semibold text-slate-900">Direccion</p>
                <p className="text-sm text-slate-600">Av. Principal 123, Consultorio 4B, Ciudad</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="mt-1 text-medical-blue" size={20} />
              <div>
                <p className="text-sm font-semibold text-slate-900">Telefono</p>
                <a href="tel:+580000000000" className="text-sm text-slate-600 hover:text-medical-blue">
                  +58 000 000 0000
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="mt-1 text-medical-blue" size={20} />
              <div>
                <p className="text-sm font-semibold text-slate-900">Email</p>
                <a
                  href="mailto:contacto@drvictor.com"
                  className="text-sm text-slate-600 hover:text-medical-blue"
                >
                  contacto@drvictor.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock3 className="mt-1 text-medical-blue" size={20} />
              <div>
                <p className="text-sm font-semibold text-slate-900">Horarios</p>
                <p className="text-sm text-slate-600">Lunes a Viernes: 8:00 AM - 5:00 PM</p>
                <p className="text-sm text-slate-600">Sabados: 8:00 AM - 1:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-[320px] overflow-hidden rounded-2xl shadow-md lg:min-h-[440px]">
          <iframe
            title="Mapa del consultorio"
            src="https://maps.google.com/maps?q=Hospital%20Clinic%20Barcelona&t=&z=13&ie=UTF8&iwloc=&output=embed"
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}

export default ContactMap
