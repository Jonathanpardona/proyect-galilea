import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

const KEY = 'monitor_v1'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const generarDatos = (base, crecimiento) =>
  MESES.map((mes, i) => ({
    mes,
    real:       i < 5 ? Math.round(base * Math.pow(1 + crecimiento / 100, i) * (0.92 + Math.random() * 0.16)) : null,
    proyectado: Math.round(base * Math.pow(1 + crecimiento / 100, i)),
  }))

const fmt = (n) => n?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }) ?? '—'

const readSaved = (field, fallback) => {
  try {
    const s = localStorage.getItem(KEY)
    if (s) {
      const v = JSON.parse(s)[field]
      return v !== undefined ? v : fallback
    }
  } catch {}
  return fallback
}

export default function MonitorCrecimiento() {
  const [loaded,          setLoaded]          = useState(false)
  const [baseIngreso,     setBaseIngreso]     = useState(() => readSaved('baseIngreso',     2500000))
  const [tasaCrecimiento, setTasaCrecimiento] = useState(() => readSaved('tasaCrecimiento', 8))
  const [metaMensual,     setMetaMensual]     = useState(() => readSaved('metaMensual',     4000000))

  useEffect(() => { setLoaded(true) }, [])
  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(KEY, JSON.stringify({ baseIngreso, tasaCrecimiento, metaMensual }))
  }, [baseIngreso, tasaCrecimiento, metaMensual, loaded])

  const datos            = generarDatos(baseIngreso, tasaCrecimiento)
  const ultimoReal       = datos.filter(d => d.real !== null).at(-1)
  const proyFinal        = datos.at(-1)?.proyectado ?? 0
  const crecimientoTotal = (((proyFinal - baseIngreso) / baseIngreso) * 100).toFixed(1)

  const ttip = { background: 'var(--ibg)', border: '1px solid var(--bdr)', borderRadius: 8, color: 'var(--tx1)', fontSize: 13 }

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--bg) 0%, var(--bg2) 100%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, var(--glow-c) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--chip)', background: 'var(--chipbg)', border: '1px solid var(--chipbd)', borderRadius: 99, padding: '3px 12px', marginBottom: 12 }}>
            REAL VS PROYECTADO · ANUAL
          </span>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--tx1)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 6 }}>
            Monitor de Crecimiento
          </h1>
          <p style={{ fontSize: 14, color: 'var(--tx2)' }}>Seguimiento de ingresos reales vs. proyectados</p>
        </div>

        <div className="modulo" style={{ marginBottom: 16 }}>
          <div className="controles-fila">
            <div className="campo">
              <label>Ingreso base (Ene)</label>
              <input type="number" value={baseIngreso} onChange={e => setBaseIngreso(Number(e.target.value))} step="100000" />
            </div>
            <div className="campo">
              <label>Tasa de crecimiento mensual (%)</label>
              <input type="number" value={tasaCrecimiento} onChange={e => setTasaCrecimiento(Number(e.target.value))} step="0.5" min="0" max="50" />
            </div>
            <div className="campo">
              <label>Meta mensual</label>
              <input type="number" value={metaMensual} onChange={e => setMetaMensual(Number(e.target.value))} step="100000" />
            </div>
          </div>
        </div>

        <div className="modulo">
          <div className="kpi-grid" style={{ marginBottom: 24 }}>
            <div className="kpi"><span>Último mes real</span><strong>{fmt(ultimoReal?.real)}</strong></div>
            <div className="kpi"><span>Proyección Dic</span><strong>{fmt(proyFinal)}</strong></div>
            <div className="kpi accent"><span>Crecimiento anual est.</span><strong>+{crecimientoTotal}%</strong></div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={datos} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bdr)" />
              <XAxis dataKey="mes" tick={{ fill: 'var(--tx2)', fontSize: 12 }} />
              <YAxis tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} tick={{ fill: 'var(--tx2)', fontSize: 12 }} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={ttip} />
              <Legend wrapperStyle={{ color: 'var(--tx2)', fontSize: 12 }} />
              <ReferenceLine y={metaMensual} stroke="#f59e0b" strokeDasharray="6 3" label={{ value: 'Meta', fill: '#f59e0b', fontSize: 12 }} />
              <Line type="monotone" dataKey="real"       name="Real"       stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} connectNulls={false} />
              <Line type="monotone" dataKey="proyectado" name="Proyectado" stroke="#475569" strokeDasharray="5 5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
