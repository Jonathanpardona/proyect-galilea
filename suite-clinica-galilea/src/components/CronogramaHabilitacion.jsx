import { useState } from 'react'

const TAREAS_INICIALES = [
  { id: 1, nombre: 'Solicitud de habilitación SEREMI', responsable: 'Director',       inicio: 1, duracion: 2, estado: 'completado' },
  { id: 2, nombre: 'Adecuación de infraestructura',   responsable: 'Administración', inicio: 1, duracion: 3, estado: 'en-curso'   },
  { id: 3, nombre: 'Adquisición de equipamiento',      responsable: 'Administración', inicio: 2, duracion: 2, estado: 'en-curso'   },
  { id: 4, nombre: 'Contrato con laboratorio referencia', responsable: 'Director',    inicio: 2, duracion: 1, estado: 'pendiente'  },
  { id: 5, nombre: 'Capacitación del personal',        responsable: 'Enfermería',     inicio: 3, duracion: 2, estado: 'pendiente'  },
  { id: 6, nombre: 'Instalación sistema LIS',          responsable: 'TI',             inicio: 3, duracion: 1, estado: 'pendiente'  },
  { id: 7, nombre: 'Marcha blanca interna',            responsable: 'Director',       inicio: 4, duracion: 1, estado: 'pendiente'  },
  { id: 8, nombre: 'Visita inspección SEREMI',         responsable: 'Director',       inicio: 5, duracion: 1, estado: 'pendiente'  },
  { id: 9, nombre: 'Apertura al público',              responsable: 'Administración', inicio: 6, duracion: 1, estado: 'pendiente'  },
]

const TOTAL_SEMANAS = 12

const ESTADO_COLOR = {
  completado:  '#22c55e',
  'en-curso':  '#3b82f6',
  pendiente:   'rgba(14,42,69,0.9)',
}

const ESTADO_TEXT = {
  completado:  '#22c55e',
  'en-curso':  '#3b82f6',
  pendiente:   '#7aaec8',
}

const ESTADOS = ['pendiente', 'en-curso', 'completado']

const chip = { display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#60a5fa', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 99, padding: '3px 12px', marginBottom: 12 }
const h1st = { fontSize: 32, fontWeight: 800, color: '#e8f4ff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 6 }

export default function CronogramaHabilitacion() {
  const [tareas, setTareas] = useState(TAREAS_INICIALES)

  const setEstado   = (id, estado) => setTareas(prev => prev.map(t => t.id === id ? { ...t, estado } : t))
  const completadas = tareas.filter(t => t.estado === 'completado').length

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #050f1e 0%, #071624 100%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(30,58,95,0.5) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1020, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <span style={chip}>GANTT · 12 SEMANAS</span>
          <h1 style={h1st}>Cronograma de Habilitación</h1>
          <p style={{ fontSize: 14, color: '#7aaec8', marginBottom: 20 }}>
            Diagrama de Gantt — {completadas}/{tareas.length} tareas completadas
          </p>
          <div style={{ height: 6, background: 'rgba(14,42,69,0.8)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(completadas / tareas.length) * 100}%`, background: '#22c55e', borderRadius: 99, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        <div className="modulo">
          <div className="gantt-wrap">
            <div className="gantt-header">
              <div className="gantt-tarea-col">Tarea</div>
              <div className="gantt-grid-header">
                {Array.from({ length: TOTAL_SEMANAS }, (_, i) => (
                  <div key={i} className="gantt-semana">S{i + 1}</div>
                ))}
              </div>
              <div className="gantt-resp-col">Responsable</div>
              <div className="gantt-estado-col">Estado</div>
            </div>

            {tareas.map(tarea => (
              <div key={tarea.id} className="gantt-fila">
                <div className="gantt-tarea-col">{tarea.nombre}</div>
                <div className="gantt-grid-body">
                  {Array.from({ length: TOTAL_SEMANAS }, (_, i) => {
                    const semana = i + 1
                    const activa  = semana >= tarea.inicio && semana < tarea.inicio + tarea.duracion
                    const esInicio = semana === tarea.inicio
                    const esFin    = semana === tarea.inicio + tarea.duracion - 1
                    return (
                      <div
                        key={i}
                        className="gantt-celda"
                        style={activa ? {
                          background: ESTADO_COLOR[tarea.estado],
                          borderRadius: `${esInicio ? '6px' : '0'} ${esFin ? '6px' : '0'} ${esFin ? '6px' : '0'} ${esInicio ? '6px' : '0'}`,
                        } : {}}
                      />
                    )
                  })}
                </div>
                <div className="gantt-resp-col">{tarea.responsable}</div>
                <div className="gantt-estado-col">
                  <select
                    value={tarea.estado}
                    onChange={e => setEstado(tarea.id, e.target.value)}
                    style={{ color: ESTADO_TEXT[tarea.estado] }}
                  >
                    {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
