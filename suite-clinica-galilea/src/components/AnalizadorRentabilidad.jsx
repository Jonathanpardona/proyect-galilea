import { useState, useMemo, useEffect } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'

const STORAGE_KEY = 'analizador_rentabilidad_v1'

// Precio = tarifa al paciente. Costo var = insumo + procesamiento en laboratorio de referencia.
const EXAMENES_INICIALES = [
  { id: 1, nombre: 'Hemograma', precio: 4500, costoVar: 2200, cantDia: 8 },
  { id: 2, nombre: 'Perfil bioquímico', precio: 9800, costoVar: 5200, cantDia: 5 },
  { id: 3, nombre: 'TSH / T4', precio: 7200, costoVar: 3900, cantDia: 4 },
  { id: 4, nombre: 'Orina completa', precio: 3500, costoVar: 1500, cantDia: 6 },
  { id: 5, nombre: 'Perfil lipídico', precio: 8500, costoVar: 4300, cantDia: 4 },
  { id: 6, nombre: 'Glicemia', precio: 3200, costoVar: 1300, cantDia: 7 },
]

const COSTOS_FIJOS_INICIALES = [
  { id: 1, nombre: 'Arriendo local', monto: 650000 },
  { id: 2, nombre: 'Sueldo TM / flebotomista', monto: 950000 },
  { id: 3, nombre: 'Director técnico (honorarios)', monto: 400000 },
  { id: 4, nombre: 'Software LIS (mensual)', monto: 90000 },
  { id: 5, nombre: 'Servicios básicos + internet', monto: 130000 },
  { id: 6, nombre: 'Contador', monto: 120000 },
  { id: 7, nombre: 'Patente + seguros', monto: 80000 },
]

const ESCENARIOS = [
  { id: 'pesimista', label: 'Pesimista', factor: 0.7, color: '#ef4444' },
  { id: 'realista', label: 'Realista', factor: 1.0, color: '#3b82f6' },
  { id: 'optimista', label: 'Optimista', factor: 1.3, color: '#22c55e' },
]

const fmt = (n) =>
  (Number.isFinite(n) ? n : 0).toLocaleString('es-CL', {
    style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
  })
const fmt1 = (n) => (Number.isFinite(n) ? n : 0).toLocaleString('es-CL', { maximumFractionDigits: 1 })

let nextExamId = EXAMENES_INICIALES.length + 1
let nextFijoId = COSTOS_FIJOS_INICIALES.length + 1

export default function AnalizadorRentabilidad() {
  const [examenes, setExamenes] = useState(EXAMENES_INICIALES)
  const [costosFijos, setCostosFijos] = useState(COSTOS_FIJOS_INICIALES)
  const [diasMes, setDiasMes] = useState(22)
  const [inversion, setInversion] = useState(8450000) // CAPEX de referencia
  const [escenario, setEscenario] = useState('realista')
  const [loaded, setLoaded] = useState(false)

  // ── Persistencia ──────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const p = JSON.parse(saved)
        if (Array.isArray(p.examenes) && p.examenes.length) {
          setExamenes(p.examenes)
          nextExamId = Math.max(...p.examenes.map(e => e.id)) + 1
        }
        if (Array.isArray(p.costosFijos) && p.costosFijos.length) {
          setCostosFijos(p.costosFijos)
          nextFijoId = Math.max(...p.costosFijos.map(c => c.id)) + 1
        }
        if (typeof p.diasMes === 'number') setDiasMes(p.diasMes)
        if (typeof p.inversion === 'number') setInversion(p.inversion)
        if (typeof p.escenario === 'string') setEscenario(p.escenario)
      }
    } catch { /* noop */ }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        examenes, costosFijos, diasMes, inversion, escenario,
      }))
    } catch { /* noop */ }
  }, [examenes, costosFijos, diasMes, inversion, escenario, loaded])

  const factor = ESCENARIOS.find(e => e.id === escenario)?.factor ?? 1

  // ── Cálculos ──────────────────────────────────────────
  const calc = useMemo(() => {
    const dias = Math.max(1, diasMes)

    const detalle = examenes.map(e => {
      const cant = Math.max(0, e.cantDia) * factor
      const margenUnit = e.precio - e.costoVar
      const cantMes = cant * dias
      return {
        ...e, margenUnit, cantMes,
        ingMes: e.precio * cantMes,
        cvMes: e.costoVar * cantMes,
        contribMes: margenUnit * cantMes,
      }
    })

    const ingresos = detalle.reduce((s, e) => s + e.ingMes, 0)
    const costoVar = detalle.reduce((s, e) => s + e.cvMes, 0)
    const examMes = detalle.reduce((s, e) => s + e.cantMes, 0)
    const contribucion = ingresos - costoVar
    const fijos = costosFijos.reduce((s, c) => s + (Number(c.monto) || 0), 0)
    const utilidad = contribucion - fijos
    const margenContribPct = ingresos > 0 ? contribucion / ingresos : 0
    const margenNetoPct = ingresos > 0 ? utilidad / ingresos : 0

    // Punto de equilibrio
    const peIngreso = margenContribPct > 0 ? fijos / margenContribPct : 0
    const contribPorExamen = examMes > 0 ? contribucion / examMes : 0
    const peExamenesMes = contribPorExamen > 0 ? fijos / contribPorExamen : 0
    const peExamenesDia = peExamenesMes / dias
    const examenesDiaActual = examMes / dias

    // Payback simple
    const paybackMeses = utilidad > 0 ? inversion / utilidad : Infinity

    return {
      detalle, ingresos, costoVar, contribucion, fijos, utilidad,
      margenContribPct, margenNetoPct, peIngreso, peExamenesDia,
      examenesDiaActual, contribPorExamen, paybackMeses, examMes, dias,
    }
  }, [examenes, costosFijos, diasMes, inversion, factor])

  // Datos para gráfico CVP (costo-volumen-utilidad)
  const cvpData = useMemo(() => {
    const { examenesDiaActual, contribPorExamen, fijos, ingresos, examMes, costoVar, dias } = calc
    const precioProm = examMes > 0 ? ingresos / examMes : 0
    const cvProm = examMes > 0 ? costoVar / examMes : 0
    const maxDia = Math.max(Math.ceil(examenesDiaActual * 1.6), Math.ceil((contribPorExamen > 0 ? fijos / contribPorExamen / dias : 0) * 1.4), 10)
    const pasos = 8
    const data = []
    for (let i = 0; i <= pasos; i++) {
      const eDia = (maxDia / pasos) * i
      const eMes = eDia * dias
      data.push({
        examenes: Math.round(eDia),
        Ingresos: Math.round(precioProm * eMes),
        'Costo total': Math.round(fijos + cvProm * eMes),
      })
    }
    return data
  }, [calc])

  // Datos waterfall (composición del resultado)
  const cascada = useMemo(() => ([
    { nombre: 'Ingresos', valor: Math.round(calc.ingresos), tipo: 'ingreso' },
    { nombre: 'Costo variable', valor: -Math.round(calc.costoVar), tipo: 'costo' },
    { nombre: 'Margen contrib.', valor: Math.round(calc.contribucion), tipo: 'margen' },
    { nombre: 'Costos fijos', valor: -Math.round(calc.fijos), tipo: 'costo' },
    { nombre: 'Utilidad', valor: Math.round(calc.utilidad), tipo: calc.utilidad >= 0 ? 'positivo' : 'negativo' },
  ]), [calc])

  const colorCascada = { ingreso: '#3b82f6', costo: '#f87171', margen: '#8b5cf6', positivo: '#22c55e', negativo: '#ef4444' }

  const sobreEquilibrio = calc.examenesDiaActual >= calc.peExamenesDia

  // ── Mutadores ─────────────────────────────────────────
  const setExam = (id, campo, val) =>
    setExamenes(prev => prev.map(e => e.id === id ? { ...e, [campo]: Math.max(0, Number(val) || 0) } : e))
  const delExam = (id) => setExamenes(prev => prev.filter(e => e.id !== id))
  const addExam = () =>
    setExamenes(prev => [...prev, { id: nextExamId++, nombre: 'Nuevo examen', precio: 5000, costoVar: 2500, cantDia: 0 }])

  const setFijo = (id, campo, val) =>
    setCostosFijos(prev => prev.map(c => c.id === id ? { ...c, [campo]: campo === 'monto' ? Math.max(0, Number(val) || 0) : val } : c))
  const delFijo = (id) => setCostosFijos(prev => prev.filter(c => c.id !== id))
  const addFijo = () =>
    setCostosFijos(prev => [...prev, { id: nextFijoId++, nombre: 'Nuevo costo', monto: 0 }])

  return (
    <div className="modulo">
      <h2>Analizador de Rentabilidad</h2>
      <p className="subtitulo">
        Costos · margen por examen · punto de equilibrio · utilidad y payback
      </p>

      {/* Controles globales */}
      <div className="controles-fila">
        <div className="campo">
          <label>Días hábiles / mes</label>
          <input type="number" min="1" max="31" value={diasMes}
            onChange={e => setDiasMes(Math.max(1, Number(e.target.value) || 1))} />
        </div>
        <div className="campo">
          <label>Inversión inicial (CAPEX)</label>
          <input type="number" min="0" step="100000" value={inversion}
            onChange={e => setInversion(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="campo">
          <label>Escenario de demanda</label>
          <div className="rent-escenarios">
            {ESCENARIOS.map(s => (
              <button
                key={s.id}
                className={`rent-esc-btn ${escenario === s.id ? 'activo' : ''}`}
                style={escenario === s.id ? { borderColor: s.color, color: s.color, background: `${s.color}14` } : undefined}
                onClick={() => setEscenario(s.id)}
              >
                {s.label}<small>×{s.factor}</small>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="kpi-grid">
        <div className="kpi">
          <span>Ingreso mensual</span>
          <strong>{fmt(calc.ingresos)}</strong>
        </div>
        <div className="kpi" style={{
          background: calc.utilidad >= 0 ? '#f0fdf4' : '#fef2f2',
          borderColor: calc.utilidad >= 0 ? '#bbf7d0' : '#fecaca',
        }}>
          <span>Utilidad operacional / mes</span>
          <strong style={{ color: calc.utilidad >= 0 ? '#15803d' : '#dc2626' }}>{fmt(calc.utilidad)}</strong>
        </div>
        <div className="kpi accent">
          <span>Margen sobre ventas</span>
          <strong>{(calc.margenNetoPct * 100).toFixed(1)}%</strong>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <span>Punto equilibrio (exám./día)</span>
          <strong>{fmt1(calc.peExamenesDia)}</strong>
        </div>
        <div className="kpi">
          <span>Punto equilibrio (ingreso/mes)</span>
          <strong>{fmt(calc.peIngreso)}</strong>
        </div>
        <div className="kpi">
          <span>Payback inversión</span>
          <strong>{Number.isFinite(calc.paybackMeses) ? `${fmt1(calc.paybackMeses)} meses` : '—'}</strong>
        </div>
      </div>

      {/* Estado vs equilibrio */}
      <div className="rent-estado" style={{
        background: sobreEquilibrio ? '#f0fdf4' : '#fff7ed',
        borderColor: sobreEquilibrio ? '#bbf7d0' : '#fed7aa',
        color: sobreEquilibrio ? '#15803d' : '#c2410c',
      }}>
        {sobreEquilibrio ? '✓' : '⚠'}{' '}
        Operas a <strong>{fmt1(calc.examenesDiaActual)}</strong> exámenes/día.{' '}
        {sobreEquilibrio
          ? `Estás ${fmt1(calc.examenesDiaActual - calc.peExamenesDia)} exám./día sobre el punto de equilibrio.`
          : `Te faltan ${fmt1(calc.peExamenesDia - calc.examenesDiaActual)} exám./día para cubrir costos.`}
      </div>

      {/* Gráficos */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div>
          <h3>Composición del resultado mensual</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={cascada} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" angle={-25} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
              <YAxis tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v) => fmt(v)} />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <Bar dataKey="valor" name="Monto" radius={[4, 4, 0, 0]}>
                {cascada.map((d, i) => <Cell key={i} fill={colorCascada[d.tipo]} />)}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3>Punto de equilibrio (costo-volumen-utilidad)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={cvpData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="examenes" tick={{ fontSize: 11 }}
                label={{ value: 'Exámenes / día', position: 'insideBottom', offset: -15, fontSize: 11, fill: '#64748b' }} />
              <YAxis tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v) => fmt(v)} labelFormatter={l => `${l} exám./día`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine x={Math.round(calc.peExamenesDia)} stroke="#f59e0b" strokeDasharray="6 3"
                label={{ value: 'Equilibrio', fill: '#f59e0b', fontSize: 11, position: 'top' }} />
              <Line type="monotone" dataKey="Ingresos" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Costo total" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla margen por examen */}
      <h3>Margen de contribución por examen</h3>
      <div className="rent-tabla-wrap">
        <table className="tabla">
          <thead>
            <tr>
              <th>Examen</th>
              <th>Precio</th>
              <th>Costo var.</th>
              <th>Margen unit.</th>
              <th>Cant./día</th>
              <th>Contrib./mes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {calc.detalle.map(e => (
              <tr key={e.id}>
                <td>
                  <input className="rent-input-txt" value={e.nombre}
                    onChange={ev => setExamenes(prev => prev.map(x => x.id === e.id ? { ...x, nombre: ev.target.value } : x))} />
                </td>
                <td><input className="input-num" type="number" min="0" value={e.precio} onChange={ev => setExam(e.id, 'precio', ev.target.value)} /></td>
                <td><input className="input-num" type="number" min="0" value={e.costoVar} onChange={ev => setExam(e.id, 'costoVar', ev.target.value)} /></td>
                <td style={{ color: e.margenUnit >= 0 ? '#15803d' : '#dc2626', fontWeight: 600 }}>{fmt(e.margenUnit)}</td>
                <td><input className="input-num" type="number" min="0" value={e.cantDia} onChange={ev => setExam(e.id, 'cantDia', ev.target.value)} /></td>
                <td style={{ fontWeight: 600 }}>{fmt(e.contribMes)}</td>
                <td><button className="btn-eliminar" onClick={() => delExam(e.id)}>✕</button></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5}><strong>Margen de contribución total</strong></td>
              <td colSpan={2}><strong>{fmt(calc.contribucion)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <button className="btn-primario" style={{ marginTop: 10 }} onClick={addExam}>+ Agregar examen</button>

      {/* Tabla costos fijos */}
      <h3 style={{ marginTop: 24 }}>Costos fijos mensuales (OPEX)</h3>
      <div className="rent-tabla-wrap">
        <table className="tabla">
          <thead>
            <tr><th>Concepto</th><th>Monto / mes</th><th></th></tr>
          </thead>
          <tbody>
            {costosFijos.map(c => (
              <tr key={c.id}>
                <td>
                  <input className="rent-input-txt" value={c.nombre}
                    onChange={ev => setFijo(c.id, 'nombre', ev.target.value)} />
                </td>
                <td><input className="input-num" style={{ width: 110 }} type="number" min="0" value={c.monto} onChange={ev => setFijo(c.id, 'monto', ev.target.value)} /></td>
                <td><button className="btn-eliminar" onClick={() => delFijo(c.id)}>✕</button></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td><strong>Total costos fijos</strong></td><td colSpan={2}><strong>{fmt(calc.fijos)}</strong></td></tr>
          </tfoot>
        </table>
      </div>
      <button className="btn-primario" style={{ marginTop: 10 }} onClick={addFijo}>+ Agregar costo fijo</button>
    </div>
  )
}
