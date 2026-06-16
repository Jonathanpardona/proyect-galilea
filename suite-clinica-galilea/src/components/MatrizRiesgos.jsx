import { useState, useMemo, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const STORAGE_KEY = 'matriz_riesgos_v1'

const CATEGORIAS = {
  Regulatorio: '#3b82f6',
  Operacional: '#8b5cf6',
  Financiero: '#f59e0b',
  Mercado: '#06b6d4',
  Competencia: '#ec4899',
}

const RIESGOS_INICIALES = [
  { id: 1, nombre: 'Atraso o rechazo de habilitación SEREMI', categoria: 'Regulatorio', prob: 3, impacto: 5, mitigacion: 'Asesoría experta, checklist completo y holgura en el cronograma.' },
  { id: 2, nombre: 'Dependencia del laboratorio de referencia (precio/incumplimiento)', categoria: 'Operacional', prob: 3, impacto: 4, mitigacion: 'Contrato con SLA y un proveedor alternativo evaluado.' },
  { id: 3, nombre: 'Demanda inicial bajo lo proyectado', categoria: 'Mercado', prob: 4, impacto: 4, mitigacion: 'Convenios B2B tempranos y plan de marketing local.' },
  { id: 4, nombre: 'Quiebre de caja por ramp-up lento', categoria: 'Financiero', prob: 3, impacto: 5, mitigacion: 'Colchón de capital de trabajo (ver Flujo de Caja) y línea de crédito.' },
  { id: 5, nombre: 'Entrada de competidor cercano', categoria: 'Competencia', prob: 3, impacto: 3, mitigacion: 'Diferenciación por servicio, rapidez y convenios exclusivos.' },
  { id: 6, nombre: 'Rotación o ausencia del TM / director técnico', categoria: 'Operacional', prob: 2, impacto: 4, mitigacion: 'Backup contratado y condiciones competitivas de retención.' },
  { id: 7, nombre: 'Rechazo de crédito o subsidio', categoria: 'Financiero', prob: 2, impacto: 4, mitigacion: 'Postular a múltiples instrumentos y tener plan B de capital propio.' },
  { id: 8, nombre: 'Falla de equipo crítico / cadena de frío', categoria: 'Operacional', prob: 2, impacto: 4, mitigacion: 'Mantención preventiva, garantía y respaldo eléctrico.' },
]

const ESCALA = [1, 2, 3, 4, 5]

const nivel = (score) => {
  if (score >= 15) return { label: 'Alto', color: '#dc2626', bg: '#fee2e2', border: '#fecaca' }
  if (score >= 8) return { label: 'Medio', color: '#d97706', bg: '#fef3c7', border: '#fde68a' }
  return { label: 'Bajo', color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' }
}

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

function loadRiesgos() {
  const p = loadSaved()
  if (Array.isArray(p.riesgos) && p.riesgos.length) return p.riesgos
  return RIESGOS_INICIALES
}

const RIESGOS_INICIAL_STATE = loadRiesgos()
let nextId = Math.max(...RIESGOS_INICIAL_STATE.map(r => r.id)) + 1

export default function MatrizRiesgos() {
  const [riesgos, setRiesgos] = useState(RIESGOS_INICIAL_STATE)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ riesgos })) } catch { /* noop */ }
  }, [riesgos])

  const conScore = useMemo(() =>
    riesgos.map(r => ({ ...r, score: r.prob * r.impacto, nivel: nivel(r.prob * r.impacto) })),
    [riesgos])

  const kpis = useMemo(() => {
    const total = conScore.length
    const altos = conScore.filter(r => r.score >= 15).length
    const medios = conScore.filter(r => r.score >= 8 && r.score < 15).length
    const promedio = total > 0 ? conScore.reduce((s, r) => s + r.score, 0) / total : 0
    const conPlan = conScore.filter(r => (r.mitigacion || '').trim().length > 0).length
    return { total, altos, medios, promedio, conPlan }
  }, [conScore])

  const porCategoria = useMemo(() =>
    Object.keys(CATEGORIAS).map(cat => ({
      name: cat,
      cantidad: conScore.filter(r => r.categoria === cat).length,
      color: CATEGORIAS[cat],
    })).filter(c => c.cantidad > 0),
    [conScore])

  // Ordenados por score desc para la tabla
  const ordenados = useMemo(() => [...conScore].sort((a, b) => b.score - a.score), [conScore])

  const setR = (id, campo, val) =>
    setRiesgos(prev => prev.map(r => r.id === id
      ? { ...r, [campo]: (campo === 'prob' || campo === 'impacto') ? Number(val) : val } : r))
  const delR = (id) => setRiesgos(prev => prev.filter(r => r.id !== id))
  const addR = () =>
    setRiesgos(prev => [...prev, { id: nextId++, nombre: 'Nuevo riesgo', categoria: 'Operacional', prob: 3, impacto: 3, mitigacion: '' }])

  // Celdas del mapa de calor (impacto 5→1 filas, probabilidad 1→5 columnas)
  const celdas = [5, 4, 3, 2, 1].flatMap(imp => ([
    <div key={`axis-${imp}`} className="risk-heat-axis">{imp}</div>,
    ...ESCALA.map(prob => {
      const score = prob * imp
      const nv = nivel(score)
      const n = conScore.filter(r => r.prob === prob && r.impacto === imp).length
      return (
        <div key={`c-${prob}-${imp}`} className="risk-cell" style={{ background: nv.bg, borderColor: nv.border }}>
          {n > 0 && <strong style={{ color: nv.color }}>{n}</strong>}
          <span style={{ color: nv.color, opacity: 0.7 }}>{score}</span>
        </div>
      )
    }),
  ]))

  return (
    <div className="modulo">
      <h2>Matriz de Riesgos</h2>
      <p className="subtitulo">
        Probabilidad × impacto · mapa de calor · plan de mitigación
      </p>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi accent">
          <span>Riesgos identificados</span>
          <strong>{kpis.total}</strong>
        </div>
        <div className="kpi" style={{ background: kpis.altos > 0 ? '#fef2f2' : '#f8fafc', borderColor: kpis.altos > 0 ? '#fecaca' : '#e2e8f0' }}>
          <span>Críticos (nivel alto)</span>
          <strong style={{ color: kpis.altos > 0 ? '#dc2626' : '#1e293b' }}>{kpis.altos}</strong>
        </div>
        <div className="kpi">
          <span>Con plan de mitigación</span>
          <strong>{kpis.conPlan}/{kpis.total}</strong>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 8 }}>
        {/* Mapa de calor */}
        <div>
          <h3>Mapa de calor</h3>
          <div className="risk-heat">{celdas}</div>
          <div className="risk-heat-foot">
            <div className="risk-heat-axis" />
            {ESCALA.map(p => <div key={`px-${p}`} className="risk-heat-axis">{p}</div>)}
          </div>
          <p className="subtitulo" style={{ textAlign: 'center', margin: '6px 0 0' }}>
            Probabilidad → &nbsp;·&nbsp; ↑ Impacto &nbsp;·&nbsp; número = riesgos en la celda
          </p>
          <div className="risk-leyenda">
            {['Bajo', 'Medio', 'Alto'].map(l => {
              const ref = l === 'Alto' ? nivel(25) : l === 'Medio' ? nivel(10) : nivel(3)
              return (
                <span key={l} className="risk-leyenda-item">
                  <span className="risk-leyenda-dot" style={{ background: ref.bg, borderColor: ref.border }} />
                  {l}
                </span>
              )
            })}
          </div>
        </div>

        {/* Riesgos por categoría */}
        <div>
          <h3>Riesgos por categoría</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={porCategoria} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v} riesgo${v !== 1 ? 's' : ''}`} />
              <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                {porCategoria.map(c => <Cell key={c.name} fill={c.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de riesgos */}
      <h3 style={{ marginTop: 16 }}>Registro de riesgos</h3>
      <div className="rent-tabla-wrap">
        <table className="tabla">
          <thead>
            <tr>
              <th>Riesgo</th><th>Categoría</th><th>Prob.</th><th>Impacto</th>
              <th>Nivel</th><th>Mitigación</th><th></th>
            </tr>
          </thead>
          <tbody>
            {ordenados.map(r => (
              <tr key={r.id}>
                <td>
                  <input className="rent-input-txt" value={r.nombre}
                    onChange={e => setR(r.id, 'nombre', e.target.value)} />
                </td>
                <td>
                  <select value={r.categoria} onChange={e => setR(r.id, 'categoria', e.target.value)}>
                    {Object.keys(CATEGORIAS).map(c => <option key={c}>{c}</option>)}
                  </select>
                </td>
                <td>
                  <select value={r.prob} onChange={e => setR(r.id, 'prob', e.target.value)}>
                    {ESCALA.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </td>
                <td>
                  <select value={r.impacto} onChange={e => setR(r.id, 'impacto', e.target.value)}>
                    {ESCALA.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </td>
                <td>
                  <span className="badge" style={{ background: r.nivel.color }}>{r.nivel.label} · {r.score}</span>
                </td>
                <td>
                  <input className="rent-input-txt" style={{ minWidth: 180 }} value={r.mitigacion}
                    placeholder="Plan de mitigación…"
                    onChange={e => setR(r.id, 'mitigacion', e.target.value)} />
                </td>
                <td><button className="btn-eliminar" onClick={() => delR(r.id)}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn-primario" style={{ marginTop: 10 }} onClick={addR}>+ Agregar riesgo</button>
    </div>
  )
}
