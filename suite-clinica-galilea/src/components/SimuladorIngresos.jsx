import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const EXAMENES = [
  { nombre: 'Hemograma', precio: 4500 },
  { nombre: 'Perfil bioquímico', precio: 9800 },
  { nombre: 'TSH / T4', precio: 7200 },
  { nombre: 'Orina completa', precio: 3500 },
  { nombre: 'Cultivo urocultivo', precio: 11000 },
  { nombre: 'PCR / VHS', precio: 5500 },
  { nombre: 'Perfil lipídico', precio: 8500 },
  { nombre: 'Glicemia', precio: 3200 },
]

const fmt = (n) => n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

export default function SimuladorIngresos() {
  const [cantidades, setCantidades] = useState(() => Object.fromEntries(EXAMENES.map(e => [e.nombre, 0])))
  const [diasMes, setDiasMes] = useState(22)

  const set = (nombre, val) => setCantidades(prev => ({ ...prev, [nombre]: Math.max(0, Number(val)) }))

  const totalesDiarios = useMemo(() =>
    EXAMENES.map(e => ({ nombre: e.nombre, ingresos: e.precio * cantidades[e.nombre] })),
    [cantidades]
  )

  const totalDia = totalesDiarios.reduce((s, e) => s + e.ingresos, 0)
  const totalMes = totalDia * diasMes
  const totalAnual = totalMes * 12

  return (
    <div className="modulo">
      <h2>Simulador de Ingresos</h2>
      <p className="subtitulo">Proyección de ingresos por exámenes diarios</p>

      <div className="grid-2">
        <div>
          <table className="tabla">
            <thead>
              <tr>
                <th>Examen</th>
                <th>Precio</th>
                <th>Cantidad/día</th>
                <th>Subtotal/día</th>
              </tr>
            </thead>
            <tbody>
              {EXAMENES.map(e => (
                <tr key={e.nombre}>
                  <td>{e.nombre}</td>
                  <td>{fmt(e.precio)}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={cantidades[e.nombre]}
                      onChange={ev => set(e.nombre, ev.target.value)}
                      className="input-num"
                    />
                  </td>
                  <td>{fmt(e.precio * cantidades[e.nombre])}</td>
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

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={totalesDiarios} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" angle={-40} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar dataKey="ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
