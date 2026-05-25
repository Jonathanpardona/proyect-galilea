import { useState } from 'react'

const ITEMS = [
  { id: 1,  categoria: 'Infraestructura', texto: 'Sala de toma de muestras con lavamanos clínico' },
  { id: 2,  categoria: 'Infraestructura', texto: 'Iluminación adecuada (mínimo 300 lux)' },
  { id: 3,  categoria: 'Infraestructura', texto: 'Ventilación e higienización del ambiente' },
  { id: 4,  categoria: 'Infraestructura', texto: 'Área de espera diferenciada' },
  { id: 5,  categoria: 'Equipamiento',    texto: 'Centrífuga calibrada y certificada' },
  { id: 6,  categoria: 'Equipamiento',    texto: 'Refrigerador de muestras con termómetro registrador' },
  { id: 7,  categoria: 'Equipamiento',    texto: 'Equipo de protección personal disponible' },
  { id: 8,  categoria: 'Equipamiento',    texto: 'Contenedor de residuos cortopunzantes (REAS)' },
  { id: 9,  categoria: 'Documentación',   texto: 'Manual de procedimientos de toma de muestras' },
  { id: 10, categoria: 'Documentación',   texto: 'Registro de cadena de frío' },
  { id: 11, categoria: 'Documentación',   texto: 'Protocolo de manejo de derrames' },
  { id: 12, categoria: 'Documentación',   texto: 'Contrato con laboratorio de referencia' },
  { id: 13, categoria: 'Personal',        texto: 'Profesional habilitado para toma de muestras' },
  { id: 14, categoria: 'Personal',        texto: 'Capacitación en bioseguridad al día' },
  { id: 15, categoria: 'Personal',        texto: 'Registro de vacunación Hepatitis B del personal' },
]

const CATEGORIAS = [...new Set(ITEMS.map(i => i.categoria))]

const chip  = { display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#60a5fa', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 99, padding: '3px 12px', marginBottom: 12 }
const h1st  = { fontSize: 32, fontWeight: 800, color: '#e8f4ff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 6 }

export default function ChecklistHabilitacion() {
  const [checked, setChecked] = useState({})

  const toggle      = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  const total       = ITEMS.length
  const completados = Object.values(checked).filter(Boolean).length
  const pct         = Math.round((completados / total) * 100)

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #050f1e 0%, #071624 100%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(30,58,95,0.5) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <span style={chip}>SEREMI SALUD · HABILITACIÓN</span>
          <h1 style={h1st}>Checklist de Habilitación</h1>
          <p style={{ fontSize: 14, color: '#7aaec8', marginBottom: 20 }}>
            Requisitos para habilitación de unidad de toma de muestras (SEREMI Salud)
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 6, background: 'rgba(14,42,69,0.8)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#22c55e' : '#3b82f6', borderRadius: 99, transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ fontSize: 13, color: '#7aaec8', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {completados}/{total} — {pct}%
            </span>
          </div>
        </div>

        <div className="modulo">
          {CATEGORIAS.map(cat => (
            <div key={cat} className="checklist-grupo">
              <h3>{cat}</h3>
              {ITEMS.filter(i => i.categoria === cat).map(item => (
                <label
                  key={item.id}
                  className={`checklist-item ${checked[item.id] ? 'checked' : ''}`}
                  style={{ justifyContent: 'flex-start' }}
                >
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
      </div>
    </div>
  )
}
