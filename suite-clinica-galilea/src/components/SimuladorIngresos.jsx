import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const EXAMENES = [
  { nombre: 'Hemograma',        precio: 4500  },
  { nombre: 'Perfil bioquímico',precio: 9800  },
  { nombre: 'TSH / T4',         precio: 7200  },
  { nombre: 'Orina completa',   precio: 3500  },
  { nombre: 'Cultivo urocultivo',precio: 11000 },
  { nombre: 'PCR / VHS',        precio: 5500  },
  { nombre: 'Perfil lipídico',  precio: 8500  },
  { nombre: 'Glicemia',         precio: 3200  },
]

const fmt = (n) => n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

const chip  = { display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#60a5fa', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 99, padding: '3px 12px', marginBottom: 12 }
const h1st  = { fontSize: 32, fontWeight: 800, color: '#e8f4ff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 6 }
const ttip  = { background: '#0a1929', border: '1px solid #0e2a45', borderRadius: 8, color: '#e8f4ff', fontSize: 13 }

export default function SimuladorIngresos() {
  const [cantidades, setCantidades] = useState(() => Object.fromEntries(EXAMENES.map(e => [e.nombre, 0])))
  const [diasMes, setDiasMes]       = useState(22)

  const set = (nombre, val) => setCantidades(prev => ({ ...prev, [nombre]: Math.max(0, Number(val)) }))

  const totalesDiarios = useMemo(() =>
    EXAMENES.map(e => ({ nombre: e.nombre, ingresos: e.precio * cantidades[e.nombre] })),
    [cantidades]
  )

  const totalDia   = totalesDiarios.reduce((s, e) => s + e.ingresos, 0)
  const totalMes   = totalDia * diasMes
  const totalAnual = totalMes * 12

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #050f1e 0%, #071624 100%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(30,58,95,0.5) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 940, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <span style={chip}>PROYECCIÓN FINANCIERA · ANUAL</span>
          <h1 style={h1st}>Simulador de Ingresos</h1>
          <p style={{ fontSize: 14, color: '#7aaec8' }}>
            Proyección de ingresos por exámenes diarios
          </p>
        </div>

        <div className="modulo">
          <div className="grid-2">
            <div>
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Examen</th>
                    <th>Precio</th>
                    <th>Cant/día</th>
                    <th>Subtotal/día</th>
                  </tr>
                </thead>
                <tbody>
                  {EXAMENES.map(e => (
                    <tr key={e.nombre}>
                      <td>{e.nombre}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(e.precio)}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={cantidades[e.nombre]}
                          onChange={ev => set(e.nombre, ev.target.value)}
                          className="input-num"
                        />
                      </td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(e.precio * cantidades[e.nombre])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="campo-inline">
                <label>Días hábiles al mes:</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={diasMes}
                  onChange={e => setDiasMes(Number(e.target.value))}
                  className="input-num"
                />
              </div>
            </div>

            <div>
              <div className="kpi-grid">
                <div className="kpi">
                  <span>Ingreso diario</span>
                  <strong>{fmt(totalDia)}</strong>
                </div>
                <div className="kpi">
                  <span>Ingreso mensual</span>
                  <strong>{fmt(totalMes)}</strong>
                </div>
                <div className="kpi accent">
                  <span>Ingreso anual</span>
                  <strong>{fmt(totalAnual)}</strong>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={totalesDiarios} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,42,69,0.8)" />
                  <XAxis dataKey="nombre" angle={-40} textAnchor="end" tick={{ fill: '#7aaec8', fontSize: 11 }} interval={0} />
                  <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: '#7aaec8', fontSize: 11 }} />
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={ttip} />
                  <Bar dataKey="ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
