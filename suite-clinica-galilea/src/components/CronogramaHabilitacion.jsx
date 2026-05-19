import { useState } from 'react'

const TAREAS_INICIALES = [
  { id: 1, nombre: 'Solicitud de habilitación SEREMI', responsable: 'Director', inicio: 1, duracion: 2, estado: 'completado' },
  { id: 2, nombre: 'Adecuación de infraestructura', responsable: 'Administración', inicio: 1, duracion: 3, estado: 'en-curso' },
  { id: 3, nombre: 'Adquisición de equipamiento', responsable: 'Administración', inicio: 2, duracion: 2, estado: 'en-curso' },
  { id: 4, nombre: 'Contrato con laboratorio referencia', responsable: 'Director', inicio: 2, duracion: 1, estado: 'pendiente' },
  { id: 5, nombre: 'Capacitación del personal', responsable: 'Enfermería', inicio: 3, duracion: 2, estado: 'pendiente' },
  { id: 6, nombre: 'Instalación sistema LIS', responsable: 'TI', inicio: 3, duracion: 1, estado: 'pendiente' },
  { id: 7, nombre: 'Marcha blanca interna', responsable: 'Director', inicio: 4, duracion: 1, estado: 'pendiente' },
  { id: 8, nombre: 'Visita inspección SEREMI', responsable: 'Director', inicio: 5, duracion: 1, estado: 'pendiente' },
  { id: 9, nombre: 'Apertura al público', responsable: 'Administración', inicio: 6, duracion: 1, estado: 'pendiente' },
]

const TOTAL_SEMANAS = 12

const ESTADO_COLOR = {
  completado: '#22c55e',
  'en-curso': '#3b82f6',
  pendiente: '#e2e8f0',
}

const ESTADO_TEXT = {
  completado: '#fff',
  'en-curso': '#fff',
  pendiente: '#64748b',
}

const ESTADOS = ['pendiente', 'en-curso', 'completado']

export default function CronogramaHabilitacion() {
  const [tareas, setTareas] = useState(TAREAS_INICIALES)

  const setEstado = (id, estado) =>
    setTareas(prev => prev.map(t => t.id === id ? { ...t, estado } : t))

  const completadas = tareas.filter(t => t.estado === 'completado').length

  return (
    <div className="modulo">
      <h2>Cronograma de Habilitación</h2>
      <p className="subtitulo">Diagrama de Gantt — {completadas}/{tareas.length} tareas completadas</p>

      <div className="progreso-bar-wrap">
        <div className="progreso-bar">
          <div
            className="progreso-fill"
            style={{ width: `${(completadas / tareas.length) * 100}%`, background: '#22c55e' }}
          />
        </div>
      </div>

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
                const activa = semana >= tarea.inicio && semana < tarea.inicio + tarea.duracion
                const esInicio = semana === tarea.inicio
                const esFin = semana === tarea.inicio + tarea.duracion - 1
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
                style={{ color: ESTADO_COLOR[tarea.estado] !== '#e2e8f0' ? ESTADO_COLOR[tarea.estado] : '#64748b' }}
              >
                {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
