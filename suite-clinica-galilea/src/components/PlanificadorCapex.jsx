import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CATEGORIAS_COLOR = {
  Equipamiento:    '#3b82f6',
  Infraestructura: '#8b5cf6',
  'TI y Software': '#06b6d4',
  Mobiliario:      '#f59e0b',
  Otros:           '#94a3b8',
}

const ITEMS_INICIALES = [
  { id: 1, nombre: 'Centrífuga clínica',               categoria: 'Equipamiento',    costo: 1800000, mes: 1 },
  { id: 2, nombre: 'Refrigerador muestras',             categoria: 'Equipamiento',    costo: 950000,  mes: 1 },
  { id: 3, nombre: 'Adecuación sala toma de muestras',  categoria: 'Infraestructura', costo: 3500000, mes: 1 },
  { id: 4, nombre: 'Sistema LIS (laboratorio)',         categoria: 'TI y Software',   costo: 1200000, mes: 2 },
  { id: 5, nombre: 'Sillas y camilla',                  categoria: 'Mobiliario',      costo: 680000,  mes: 2 },
  { id: 6, nombre: 'EPP stock inicial',                 categoria: 'Equipamiento',    costo: 320000,  mes: 1 },
]

const fmt = (n) => n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

let nextId = ITEMS_INICIALES.length + 1

export default function PlanificadorCapex() {
  const [items, setItems] = useState(ITEMS_INICIALES)
  const [nuevo, setNuevo] = useState({ nombre: '', categoria: 'Equipamiento', costo: '', mes: 1 })

  const agregar = () => {
    if (!nuevo.nombre || !nuevo.costo) return
    setItems(prev => [...prev, { ...nuevo, id: nextId++, costo: Number(nuevo.costo) }])
    setNuevo({ nombre: '', categoria: 'Equipamiento', costo: '', mes: 1 })
  }
  const eliminar = (id) => setItems(prev => prev.filter(i => i.id !== id))

  const total        = useMemo(() => items.reduce((s, i) => s + i.costo, 0), [items])
  const porCategoria = useMemo(() => {
    const map = {}
    items.forEach(i => { map[i.categoria] = (map[i.categoria] || 0) + i.costo })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [items])

  const ttip = { background: 'var(--ibg)', border: '1px solid var(--bdr)', borderRadius: 8, color: 'var(--tx1)', fontSize: 13 }

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--bg) 0%, var(--bg2) 100%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, var(--glow-c) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 940, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--chip)', background: 'var(--chipbg)', border: '1px solid var(--chipbd)', borderRadius: 99, padding: '3px 12px', marginBottom: 12 }}>
            CAPEX · INVERSIÓN INICIAL
          </span>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--tx1)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 6 }}>
            Planificador CAPEX
          </h1>
          <p style={{ fontSize: 14, color: 'var(--tx2)' }}>Inversión inicial para habilitación de la unidad</p>
        </div>

        <div className="modulo">
          <div className="grid-2">
            <div>
              <table className="tabla">
                <thead>
                  <tr><th>Ítem</th><th>Categoría</th><th>Mes</th><th>Costo</th><th></th></tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>{item.nombre}</td>
                      <td><span className="badge" style={{ background: CATEGORIAS_COLOR[item.categoria], color: '#fff' }}>{item.categoria}</span></td>
                      <td>M{item.mes}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(item.costo)}</td>
                      <td><button className="btn-eliminar" onClick={() => eliminar(item.id)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}><strong>Total CAPEX</strong></td>
                    <td colSpan={2}><strong style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(total)}</strong></td>
                  </tr>
                </tfoot>
              </table>
              <div className="form-agregar">
                <input placeholder="Nombre del ítem" value={nuevo.nombre} onChange={e => setNuevo(p => ({ ...p, nombre: e.target.value }))} />
                <select value={nuevo.categoria} onChange={e => setNuevo(p => ({ ...p, categoria: e.target.value }))}>
                  {Object.keys(CATEGORIAS_COLOR).map(c => <option key={c}>{c}</option>)}
                </select>
                <input type="number" placeholder="Costo $"  value={nuevo.costo} onChange={e => setNuevo(p => ({ ...p, costo: e.target.value }))} />
                <input type="number" placeholder="Mes" min="1" max="12" value={nuevo.mes} onChange={e => setNuevo(p => ({ ...p, mes: Number(e.target.value) }))} />
                <button className="btn-primario" onClick={agregar}>Agregar</button>
              </div>
            </div>

            <div>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={porCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} innerRadius={40}>
                    {porCategoria.map(entry => (
                      <Cell key={entry.name} fill={CATEGORIAS_COLOR[entry.name] ?? '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={ttip} />
                  <Legend formatter={(v) => <span style={{ color: 'var(--tx2)', fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
