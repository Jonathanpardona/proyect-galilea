import { useState, useMemo, useEffect } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const STORAGE_KEY = 'estudio_demanda_v1'

const SEGMENTOS_INICIALES = { fonasa: 55, isapre: 15, particular: 20, b2b: 10 }
const SEG_META = {
  fonasa: { label: 'FONASA', color: '#3b82f6' },
  isapre: { label: 'ISAPRE', color: '#8b5cf6' },
  particular: { label: 'Particular', color: '#f59e0b' },
  b2b: { label: 'B2B (empresas)', color: '#22c55e' },
}

const COMPETIDORES_INICIALES = [
  { id: 1, nombre: 'Lab. Centro', distanciaKm: 1.2, precioProm: 6800 },
  { id: 2, nombre: 'Clínica Regional', distanciaKm: 3.5, precioProm: 8200 },
  { id: 3, nombre: 'Centro Médico Sur', distanciaKm: 5.0, precioProm: 7500 },
]

const fmt = (n) =>
  (Number.isFinite(n) ? n : 0).toLocaleString('es-CL', {
    style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
  })
const fmtN = (n) => Math.round(Number.isFinite(n) ? n : 0).toLocaleString('es-CL')
const fmt1 = (n) => (Number.isFinite(n) ? n : 0).toLocaleString('es-CL', { maximumFractionDigits: 1 })

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}
const numOr = (v, def) => typeof v === 'number' ? v : def

const SAVED = loadSaved()
let nextCompId = (Array.isArray(SAVED.competidores) && SAVED.competidores.length)
  ? Math.max(...SAVED.competidores.map(c => c.id)) + 1
  : COMPETIDORES_INICIALES.length + 1

export default function EstudioDemanda() {
  const [poblacion, setPoblacion] = useState(() => numOr(loadSaved().poblacion, 45000))
  const [pctUsaLab, setPctUsaLab] = useState(() => numOr(loadSaved().pctUsaLab, 35))
  const [visitasAnio, setVisitasAnio] = useState(() => numOr(loadSaved().visitasAnio, 1.8))
  const [examenesVisita, setExamenesVisita] = useState(() => numOr(loadSaved().examenesVisita, 2.2))
  const [pctAlcanzable, setPctAlcanzable] = useState(() => numOr(loadSaved().pctAlcanzable, 60))
  const [marketShare, setMarketShare] = useState(() => numOr(loadSaved().marketShare, 12))
  const [ticket, setTicket] = useState(() => numOr(loadSaved().ticket, 6500))
  const [diasMes, setDiasMes] = useState(() => numOr(loadSaved().diasMes, 22))
  const [capacidadDia, setCapacidadDia] = useState(() => numOr(loadSaved().capacidadDia, 60))
  const [segmentos, setSegmentos] = useState(() => {
    const s = loadSaved().segmentos
    return (s && typeof s === 'object') ? s : SEGMENTOS_INICIALES
  })
  const [competidores, setCompetidores] = useState(() => {
    const c = loadSaved().competidores
    return (Array.isArray(c) && c.length) ? c : COMPETIDORES_INICIALES
  })

  // ── Persistencia ──────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        poblacion, pctUsaLab, visitasAnio, examenesVisita, pctAlcanzable,
        marketShare, ticket, diasMes, capacidadDia, segmentos, competidores,
      }))
    } catch { /* noop */ }
  }, [poblacion, pctUsaLab, visitasAnio, examenesVisita, pctAlcanzable,
      marketShare, ticket, diasMes, capacidadDia, segmentos, competidores])

  // ── Cálculos ──────────────────────────────────────────
  const calc = useMemo(() => {
    const dias = Math.max(1, diasMes)
    // Demanda en exámenes/año
    const tam = poblacion * (pctUsaLab / 100) * visitasAnio * examenesVisita
    const sam = tam * (pctAlcanzable / 100)
    const som = sam * (marketShare / 100)

    const somMes = som / 12
    const somDia = somMes / dias
    const ingresoMes = somMes * ticket
    const ingresoAnual = som * ticket
    const usoCapacidad = capacidadDia > 0 ? somDia / capacidadDia : 0

    return { tam, sam, som, somMes, somDia, ingresoMes, ingresoAnual, usoCapacidad, dias }
  }, [poblacion, pctUsaLab, visitasAnio, examenesVisita, pctAlcanzable,
      marketShare, ticket, diasMes, capacidadDia])

  // Embudo TAM → SAM → SOM
  const embudo = useMemo(() => {
    const max = calc.tam || 1
    return [
      { id: 'tam', label: 'Mercado total (TAM)', sub: 'Demanda anual de la zona', valor: calc.tam, pct: 100, color: '#1e40af' },
      { id: 'sam', label: 'Mercado alcanzable (SAM)', sub: `${pctAlcanzable}% en tu radio de servicio`, valor: calc.sam, pct: (calc.sam / max) * 100, color: '#3b82f6' },
      { id: 'som', label: 'Mercado objetivo (SOM)', sub: `${marketShare}% de participación`, valor: calc.som, pct: (calc.som / max) * 100, color: '#22c55e' },
    ]
  }, [calc, pctAlcanzable, marketShare])

  // Segmentación previsional (normalizada para el pie)
  const segData = useMemo(() => {
    const total = Object.values(segmentos).reduce((s, v) => s + (Number(v) || 0), 0)
    return Object.entries(segmentos).map(([k, v]) => ({
      key: k,
      name: SEG_META[k]?.label ?? k,
      value: Number(v) || 0,
      pct: total > 0 ? ((Number(v) || 0) / total) * 100 : 0,
      examenesMes: total > 0 ? calc.somMes * ((Number(v) || 0) / total) : 0,
      color: SEG_META[k]?.color ?? '#94a3b8',
    }))
  }, [segmentos, calc.somMes])

  const sumaSeg = Object.values(segmentos).reduce((s, v) => s + (Number(v) || 0), 0)

  // Competencia
  const compData = useMemo(() => {
    const lista = competidores.map(c => ({ ...c, esTuyo: false }))
    return [...lista, { id: 'tu', nombre: 'Tu centro', precioProm: ticket, esTuyo: true }]
  }, [competidores, ticket])

  const precioMercado = useMemo(() => {
    if (competidores.length === 0) return 0
    return competidores.reduce((s, c) => s + (Number(c.precioProm) || 0), 0) / competidores.length
  }, [competidores])

  const posicionPrecio = precioMercado > 0 ? ((ticket - precioMercado) / precioMercado) * 100 : 0

  // ── Mutadores ─────────────────────────────────────────
  const setSeg = (key, val) => setSegmentos(prev => ({ ...prev, [key]: Math.max(0, Number(val) || 0) }))
  const setComp = (id, campo, val) =>
    setCompetidores(prev => prev.map(c => c.id === id
      ? { ...c, [campo]: campo === 'nombre' ? val : Math.max(0, Number(val) || 0) } : c))
  const delComp = (id) => setCompetidores(prev => prev.filter(c => c.id !== id))
  const addComp = () =>
    setCompetidores(prev => [...prev, { id: nextCompId++, nombre: 'Nuevo competidor', distanciaKm: 0, precioProm: 7000 }])

  const num = (v, setter, opts = {}) => (
    <input type="number" value={v} min={opts.min ?? 0} max={opts.max} step={opts.step ?? 1}
      onChange={e => setter(Math.max(opts.min ?? 0, Number(e.target.value) || 0))} />
  )

  return (
    <div className="modulo">
      <h2>Estudio de Demanda / Mercado</h2>
      <p className="subtitulo">
        Tamaño de mercado (TAM·SAM·SOM) · segmentación · competencia · ingreso potencial
      </p>

      {/* Parámetros de demanda */}
      <h3>Parámetros de la zona de influencia</h3>
      <div className="controles-fila">
        <div className="campo">
          <label>Población zona de influencia</label>
          {num(poblacion, setPoblacion, { step: 1000 })}
        </div>
        <div className="campo">
          <label>% que se hace exámenes / año</label>
          {num(pctUsaLab, setPctUsaLab, { max: 100 })}
        </div>
        <div className="campo">
          <label>Visitas al año (por persona)</label>
          {num(visitasAnio, setVisitasAnio, { step: 0.1 })}
        </div>
        <div className="campo">
          <label>Exámenes por visita</label>
          {num(examenesVisita, setExamenesVisita, { step: 0.1 })}
        </div>
      </div>
      <div className="controles-fila">
        <div className="campo">
          <label>% alcanzable (radio servicio)</label>
          {num(pctAlcanzable, setPctAlcanzable, { max: 100 })}
        </div>
        <div className="campo">
          <label>Participación objetivo (%)</label>
          {num(marketShare, setMarketShare, { max: 100, step: 0.5 })}
        </div>
        <div className="campo">
          <label>Ticket promedio / examen</label>
          {num(ticket, setTicket, { step: 500 })}
        </div>
        <div className="campo">
          <label>Días hábiles / mes</label>
          {num(diasMes, setDiasMes, { min: 1, max: 31 })}
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi accent">
          <span>Demanda objetivo (SOM)</span>
          <strong>{fmtN(calc.som)} exám./año</strong>
        </div>
        <div className="kpi">
          <span>Demanda captable / día</span>
          <strong>{fmt1(calc.somDia)} exám.</strong>
        </div>
        <div className="kpi">
          <span>Ingreso potencial / mes</span>
          <strong>{fmt(calc.ingresoMes)}</strong>
        </div>
      </div>

      {/* Embudo de mercado */}
      <h3>Embudo de mercado (exámenes / año)</h3>
      <div className="mkt-funnel">
        {embudo.map(e => (
          <div key={e.id} className="mkt-funnel-row">
            <div className="mkt-funnel-head">
              <span className="mkt-funnel-label">{e.label} <small>· {e.sub}</small></span>
              <span className="mkt-funnel-val">{fmtN(e.valor)}</span>
            </div>
            <div className="mkt-bar-track">
              <div className="mkt-bar-fill" style={{ width: `${Math.max(2, e.pct)}%`, background: e.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Capacidad */}
      <div className="rent-estado" style={{
        background: calc.usoCapacidad <= 1 ? '#f0fdf4' : '#fff7ed',
        borderColor: calc.usoCapacidad <= 1 ? '#bbf7d0' : '#fed7aa',
        color: calc.usoCapacidad <= 1 ? '#15803d' : '#c2410c',
      }}>
        {calc.usoCapacidad <= 1 ? '✓' : '⚠'}{' '}
        La demanda objetivo usa <strong>{(calc.usoCapacidad * 100).toFixed(0)}%</strong> de tu capacidad
        ({fmt1(calc.somDia)} de {fmtN(capacidadDia)} exám./día).{' '}
        {calc.usoCapacidad <= 1
          ? 'Capacidad suficiente para absorber la demanda.'
          : 'La demanda supera tu capacidad: evalúa ampliar dotación u horario.'}
        <div className="campo-inline" style={{ marginTop: 8 }}>
          <label>Capacidad atendible / día:</label>
          {num(capacidadDia, setCapacidadDia, { min: 1, step: 5 })}
        </div>
      </div>

      {/* Segmentación + Competencia precios */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div>
          <h3>Segmentación por previsión</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={segData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95}
                label={({ name, pct }) => `${name} ${pct.toFixed(0)}%`} labelLine={false}>
                {segData.map(s => <Cell key={s.key} fill={s.color} />)}
              </Pie>
              <Tooltip formatter={(v, _n, p) => `${v} (${p.payload.pct.toFixed(0)}% · ${fmtN(p.payload.examenesMes)} exám./mes)`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="form-agregar" style={{ marginTop: 4 }}>
            {Object.keys(SEG_META).map(k => (
              <div className="campo" key={k} style={{ flex: 1, minWidth: 110 }}>
                <label>{SEG_META[k].label} (%)</label>
                <input type="number" min="0" max="100" value={segmentos[k]}
                  onChange={e => setSeg(k, e.target.value)} />
              </div>
            ))}
          </div>
          {Math.abs(sumaSeg - 100) > 0.5 && (
            <p className="subtitulo" style={{ marginTop: 8, color: '#c2410c' }}>
              ⚠ Los porcentajes suman {fmt1(sumaSeg)}% (se normalizan para el gráfico).
            </p>
          )}
        </div>

        <div>
          <h3>Precios vs. competencia</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={compData} margin={{ top: 10, right: 10, left: 10, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmt(v)} />
              {precioMercado > 0 && (
                <ReferenceLine y={precioMercado} stroke="#f59e0b" strokeDasharray="6 3"
                  label={{ value: 'Prom. mercado', fill: '#f59e0b', fontSize: 11, position: 'insideTopRight' }} />
              )}
              <Bar dataKey="precioProm" name="Precio promedio" radius={[4, 4, 0, 0]}>
                {compData.map(c => <Cell key={c.id} fill={c.esTuyo ? '#22c55e' : '#94a3b8'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="subtitulo" style={{ marginTop: 4 }}>
            Tu ticket está <strong style={{ color: posicionPrecio <= 0 ? '#15803d' : '#c2410c' }}>
              {posicionPrecio >= 0 ? '+' : ''}{fmt1(posicionPrecio)}%
            </strong> respecto al promedio de mercado ({fmt(precioMercado)}).
          </p>
        </div>
      </div>

      {/* Tabla competencia */}
      <h3 style={{ marginTop: 8 }}>Competidores en la zona</h3>
      <div className="rent-tabla-wrap">
        <table className="tabla">
          <thead>
            <tr><th>Competidor</th><th>Distancia (km)</th><th>Precio promedio</th><th></th></tr>
          </thead>
          <tbody>
            {competidores.map(c => (
              <tr key={c.id}>
                <td>
                  <input className="rent-input-txt" value={c.nombre}
                    onChange={e => setComp(c.id, 'nombre', e.target.value)} />
                </td>
                <td><input className="input-num" type="number" min="0" step="0.1" value={c.distanciaKm} onChange={e => setComp(c.id, 'distanciaKm', e.target.value)} /></td>
                <td><input className="input-num" style={{ width: 100 }} type="number" min="0" step="100" value={c.precioProm} onChange={e => setComp(c.id, 'precioProm', e.target.value)} /></td>
                <td><button className="btn-eliminar" onClick={() => delComp(c.id)}>✕</button></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td><strong>Precio promedio mercado</strong></td><td></td><td colSpan={2}><strong>{fmt(precioMercado)}</strong></td></tr>
          </tfoot>
        </table>
      </div>
      <button className="btn-primario" style={{ marginTop: 10 }} onClick={addComp}>+ Agregar competidor</button>
    </div>
  )
}
