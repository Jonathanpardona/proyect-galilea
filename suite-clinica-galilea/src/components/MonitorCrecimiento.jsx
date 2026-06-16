import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'

const STORAGE_KEY = 'monitor_crecimiento_v1'
function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}
const numOr = (v, def) => typeof v === 'number' ? v : def

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const generarDatos = (base, crecimiento) =>
  MESES.map((mes, i) => ({
    mes,
    real: i < 5 ? Math.round(base * Math.pow(1 + crecimiento / 100, i) * (0.92 + Math.random() * 0.16)) : null,
    proyectado: Math.round(base * Math.pow(1 + crecimiento / 100, i)),
  }))

const fmt = (n) => n?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }) ?? '—'

export default function MonitorCrecimiento() {
  const [baseIngreso, setBaseIngreso] = useState(() => numOr(loadSaved().baseIngreso, 2500000))
  const [tasaCrecimiento, setTasaCrecimiento] = useState(() => numOr(loadSaved().tasaCrecimiento, 8))
  const [metaMensual, setMetaMensual] = useState(() => numOr(loadSaved().metaMensual, 4000000))

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ baseIngreso, tasaCrecimiento, metaMensual })) } catch { /* noop */ }
  }, [baseIngreso, tasaCrecimiento, metaMensual])

  const datos = generarDatos(baseIngreso, tasaCrecimiento)
  const ultimoReal = datos.filter(d => d.real !== null).at(-1)
  const proyFinal = datos.at(-1)?.proyectado ?? 0
  const crecimientoTotal = (((proyFinal - baseIngreso) / baseIngreso) * 100).toFixed(1)

  return (
    <div className="modulo">
      <h2>Monitor de Crecimiento</h2>
      <p className="subtitulo">Seguimiento de ingresos reales vs. proyectados</p>

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
            step="0.5"
            min="0"
            max="50"
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

      <div className="kpi-grid">
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

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={datos} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} />
          <Tooltip formatter={(v) => fmt(v)} />
          <Legend />
          <ReferenceLine y={metaMensual} stroke="#f59e0b" strokeDasharray="6 3" label={{ value: 'Meta', fill: '#f59e0b', fontSize: 12 }} />
          <Line type="monotone" dataKey="real" name="Real" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
          <Line type="monotone" dataKey="proyectado" name="Proyectado" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
