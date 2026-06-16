import { useState, useEffect } from 'react'

const STORAGE_KEY = 'checklist_habilitacion_v1'
function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

const ITEMS = [
  { id: 1, categoria: 'Infraestructura', texto: 'Sala de toma de muestras con lavamanos clínico' },
  { id: 2, categoria: 'Infraestructura', texto: 'Iluminación adecuada (mínimo 300 lux)' },
  { id: 3, categoria: 'Infraestructura', texto: 'Ventilación e higienización del ambiente' },
  { id: 4, categoria: 'Infraestructura', texto: 'Área de espera diferenciada' },
  { id: 5, categoria: 'Equipamiento', texto: 'Centrífuga calibrada y certificada' },
  { id: 6, categoria: 'Equipamiento', texto: 'Refrigerador de muestras con termómetro registrador' },
  { id: 7, categoria: 'Equipamiento', texto: 'Equipo de protección personal disponible' },
  { id: 8, categoria: 'Equipamiento', texto: 'Contenedor de residuos cortopunzantes (REAS)' },
  { id: 9, categoria: 'Documentación', texto: 'Manual de procedimientos de toma de muestras' },
  { id: 10, categoria: 'Documentación', texto: 'Registro de cadena de frío' },
  { id: 11, categoria: 'Documentación', texto: 'Protocolo de manejo de derrames' },
  { id: 12, categoria: 'Documentación', texto: 'Contrato con laboratorio de referencia' },
  { id: 13, categoria: 'Personal', texto: 'Profesional habilitado para toma de muestras' },
  { id: 14, categoria: 'Personal', texto: 'Capacitación en bioseguridad al día' },
  { id: 15, categoria: 'Personal', texto: 'Registro de vacunación Hepatitis B del personal' },
]

const CATEGORIAS = [...new Set(ITEMS.map(i => i.categoria))]

export default function ChecklistHabilitacion() {
  const [checked, setChecked] = useState(() => loadSaved().checked ?? {})

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ checked })) } catch { /* noop */ }
  }, [checked])

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  const total = ITEMS.length
  const completados = Object.values(checked).filter(Boolean).length
  const pct = Math.round((completados / total) * 100)

  return (
    <div className="modulo">
      <h2>Checklist de Habilitación</h2>
      <p className="subtitulo">Requisitos para habilitación de unidad de toma de muestras (SEREMI Salud)</p>

      <div className="progreso-bar-wrap">
        <div className="progreso-label">{completados} / {total} requisitos — {pct}%</div>
        <div className="progreso-bar">
          <div className="progreso-fill" style={{ width: `${pct}%`, background: pct === 100 ? '#22c55e' : '#3b82f6' }} />
        </div>
      </div>

      {CATEGORIAS.map(cat => (
        <div key={cat} className="checklist-grupo">
          <h3>{cat}</h3>
          {ITEMS.filter(i => i.categoria === cat).map(item => (
            <label key={item.id} className={`checklist-item ${checked[item.id] ? 'checked' : ''}`}>
              <input
                type="checkbox"
                checked={!!checked[item.id]}
                onChange={() => toggle(item.id)}
              />
              <span>{item.texto}</span>
            </label>
          ))}
        </div>
      ))}
    </div>
  )
}
