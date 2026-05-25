import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const generarDatos = (base, crecimiento) =>
  MESES.map((mes, i) => ({
    mes,
    real:        i < 5 ? Math.round(base * Math.pow(1 + crecimiento / 100, i) * (0.92 + Math.random() * 0.16)) : null,
    proyectado:  Math.round(base * Math.pow(1 + crecimiento / 100, i)),
  }))

const fmt = (n) => n?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }) ?? '—'

const chip  = { display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#60a5fa', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 99, padding: '3px 12px', marginBottom: 12 }
const h1st  = { fontSize: 32, fontWeight: 800, color: '#e8f4ff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 6 }
const ttip  = { background: '#0a1929', border: '1px solid #0e2a45', borderRadius: 8, color: '#e8f4ff', fontSize: 13 }

export default function MonitorCrecimiento() {
  const [baseIngreso,     setBaseIngreso]     = useState(2500000)
  const [tasaCrecimiento, setTasaCrecimiento] = useState(8)
  const [metaMensual,     setMetaMensual]     = useState(4000000)

  const datos            = generarDatos(baseIngreso, tasaCrecimiento)
  const ultimoReal       = datos.filter(d => d.real !== null).at(-1)
  const proyFinal        = datos.at(-1)?.proyectado ?? 0
  const crecimientoTotal = (((proyFinal - baseIngreso) / baseIngreso) * 100).toFixed(1)

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #050f1e 0%, #071624 100%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(30,58,95,0.5) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <span style={chip}>REAL VS PROYECTADO · ANUAL</span>
          <h1 style={h1st}>Monitor de Crecimiento</h1>
          <p style={{ fontSize: 14, color: '#7aaec8' }}>
            Seguimiento de ingresos reales vs. proyectados
          </p>
        </div>

        {/* Parámetros */}
        <div className="modulo" style={{ marginBottom: 16 }}>
          <div className="controles-fila">
            <div className="campo">
              <label>Ingreso base (Ene)</label>
              <input
                type="number"
                value={baseIngreso}
                onChange={e => setBaseIngreso(Number(e.target.value))}
                step="100000"
              />
            </div>
            <div className="campo">
              <label>Tasa de crecimiento mensual (%)</label>
              <input
                type="number"
                value={tasaCrecimiento}
                onChange={e => setTasaCrecimiento(Number(e.target.value))}
                step="0.5" min="0" max="50"
              />
            </div>
            <div className="campo">
              <label>Meta mensual</label>
              <input
                type="number"
                value={metaMensual}
                onChange={e => setMetaMensual(Number(e.target.value))}
                step="100000"
              />
            </div>
          </div>
        </div>

        {/* KPIs + gráfico */}
        <div className="modulo">
          <div className="kpi-grid" style={{ marginBottom: 24 }}>
            <div className="kpi">
              <span>Último mes real</span>
              <strong>{fmt(ultimoReal?.real)}</strong>
            </div>
            <div className="kpi">
              <span>Proyección Dic</span>
              <strong>{fmt(proyFinal)}</strong>
            </div>
            <div className="kpi accent">
              <span>Crecimiento anual est.</span>
              <strong>+{crecimientoTotal}%</strong>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={datos} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,42,69,0.8)" />
              <XAxis dataKey="mes" tick={{ fill: '#7aaec8', fontSize: 12 }} />
              <YAxis tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} tick={{ fill: '#7aaec8', fontSize: 12 }} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={ttip} />
              <Legend wrapperStyle={{ color: '#7aaec8', fontSize: 12 }} />
              <ReferenceLine
                y={metaMensual}
                stroke="#f59e0b"
                strokeDasharray="6 3"
                label={{ value: 'Meta', fill: '#f59e0b', fontSize: 12 }}
              />
              <Line type="monotone" dataKey="real"       name="Real"       stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} connectNulls={false} />
              <Line type="monotone" dataKey="proyectado" name="Proyectado" stroke="#475569" strokeDasharray="5 5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
