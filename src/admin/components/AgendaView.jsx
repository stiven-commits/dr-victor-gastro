import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Loader2, Plus } from 'lucide-react';
import { CreateAppointmentModal } from './Modals';

export default function AgendaView({ API_KEY, leads }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const N8N_GET_URL = 'https://victorbot.sosmarketing.agency/webhook/obtener-citas';
  const N8N_MOVE_URL = 'https://victorbot.sosmarketing.agency/webhook/mover-cita';
  const N8N_CREATE_URL = 'https://victorbot.sosmarketing.agency/webhook/crear-cita';
  const N8N_DELETE_APP_URL = 'https://victorbot.sosmarketing.agency/webhook/eliminar-cita';

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${N8N_GET_URL}?t=${new Date().getTime()}`, {
        headers: { 'Authorization': API_KEY }
      });
      const data = await response.json();
      
      // Función para aplanar cualquier respuesta que mande n8n
      let rawEvents = [];
      if (Array.isArray(data)) {
        if (data.length > 0 && Array.isArray(data[0])) {
          rawEvents = data[0]; // Si es [ [ {...} ] ]
        } else {
          rawEvents = data; // Si es [ {...} ]
        }
      } else if (data && typeof data === 'object') {
        rawEvents = data.data || [data]; // Si es { data: [...] }
      }

      // Escudo protector de Zonas Horarias
      const ensureUTC = (dateStr) => {
        if (!dateStr) return '';
        // Si no trae la 'Z' y tampoco trae un indicador de zona (+ o -), inyectamos la Z.
        if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('-')) {
          return `${dateStr}Z`;
        }
        return dateStr;
      };

      const formattedEvents = rawEvents
        .filter(appt => appt && appt.start_time)
        .map(appt => ({
          id: appt.google_event_id,
          title: appt.title,
          start: ensureUTC(appt.start_time),
          end: ensureUTC(appt.end_time),
          extendedProps: { patient_id: appt.patient_id, patient_name: appt.patient_name }
        }));

      setEvents(formattedEvents);
    } catch (error) { 
      console.error("Error al obtener las citas:", error); 
    }
    setLoading(false);
  };
  useEffect(() => { fetchEvents(); }, []);

  const handleEventDrop = async (info) => {
    const { event } = info;
    const payload = {
      google_event_id: event.id,
      start_time: event.startStr,
      end_time: event.endStr
    };
    
    try {
      await fetch(N8N_MOVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
        body: JSON.stringify(payload)
      });
    } catch (error) { 
      console.error(error);
      info.revert(); 
    }
  };

  const handleCreateAppointment = async (e, formData) => {
    e.preventDefault();
    const start = new Date(`${formData.date}T${formData.time}`);
    const durationMins = parseInt(formData.duration) || 20;
    const end = new Date(start.getTime() + durationMins * 60000); 
    
    // 1. VALIDACIÓN: Prevenir que las citas se solapen
    const hasOverlap = events.some(event => {
      const evStart = new Date(event.start);
      const evEnd = new Date(event.end);
      // Condición de solapamiento de tiempo
      return (start < evEnd && end > evStart);
    });

    if (hasOverlap) {
      alert('⚠️ Ya existe una cita agendada en ese horario. Por favor elige una hora diferente para evitar choques.');
      return; // Detenemos la creación
    }

    const payload = {
      patient_id: formData.patient_id,
      patient_email: formData.patient_email,
      title: formData.title,
      start_time: start.toISOString(),
      end_time: end.toISOString()
    };
    
    setIsModalOpen(false);
    
    // 2. ACTUALIZACIÓN OPTIMISTA: Dibujar la cita en pantalla inmediatamente
    const patientName = formData.title.replace('Consulta - ', '');
    const tempEvent = {
      id: 'temp-' + Date.now(),
      title: formData.title,
      start: start.toISOString(),
      end: end.toISOString(),
      extendedProps: { patient_id: formData.patient_id, patient_name: patientName }
    };
    
    setEvents(prevEvents => [...prevEvents, tempEvent]);

    try {
      await fetch(N8N_CREATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
        body: JSON.stringify(payload)
      });
      
      // Le damos 2 segundos a la base de datos y a Google Calendar 
      // para terminar de procesar la transacción antes de pedir los datos de nuevo.
      setTimeout(() => {
        fetchEvents();
      }, 2000);
      
    } catch (error) { 
      console.error(error); 
      fetchEvents(); 
    }
  };

  const handleEventClick = async (info) => {
    const { event } = info;
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas cancelar y eliminar la cita de: ${event.title}?`);
    
    if (confirmDelete) {
      const payload = { google_event_id: event.id };
      event.remove(); // EliminaciÃƒÂ³n optimista de la pantalla
      
      try {
        await fetch(N8N_DELETE_APP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
          body: JSON.stringify(payload)
        });
      } catch (error) { 
        console.error(error); 
        fetchEvents(); // Si falla, recargamos los eventos para restaurarlo
      }
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#0056b3]" /></div>;

  return (
    <div className="bg-white p-2 md:p-6 rounded-2xl shadow-sm border border-gray-100 relative z-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Calendario de Consultas</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#0056b3] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-sm">
          <Plus size={18} /> Agendar Cita
        </button>
      </div>
      
      <FullCalendar
        plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
        initialView="timeGridWeek"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        events={events}
        editable={true}
        eventDrop={handleEventDrop}
        eventClick={handleEventClick}
        height="700px"
        slotMinTime="08:00:00"
        slotMaxTime="16:00:00"
        slotDuration="00:20:00"
        allDaySlot={false}
        eventOverlap={false}
        locale="es"
        buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }}
        eventColor="#0056b3"
        eventDidMount={(info) => {
          // Usar el nombre del paciente extraído de las propiedades o limpiar el título
          const pName = info.event.extendedProps?.patient_name || info.event.title.replace('Consulta - ', '');
          info.el.setAttribute('title', `${pName} (${info.timeText})`);
        }}
      />
      <CreateAppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} leads={leads} handleCreate={handleCreateAppointment} />
    </div>
  );
}
