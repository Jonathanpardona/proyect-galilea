import { useState, useMemo, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const STORAGE_KEY = 'planificador_capex_v1'
function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

const CATEGORIAS_COLOR = {
  Equipamiento: '#3b82f6',
  'Infraestructura': '#8b5cf6',
  'TI y Software': '#06b6d4',
  Mobiliario: '#f59e0b',
  Otros: '#94a3b8',
}

const ITEMS_INICIALES = [
  { id: 1, nombre: 'Centrífuga clínica', categoria: 'Equipamiento', costo: 1800000, mes: 1 },
  { id: 2, nombre: 'Refrigerador muestras', categoria: 'Equipamiento', costo: 950000, mes: 1 },
  { id: 3, nombre: 'Adecuación sala toma de muestras', categoria: 'Infraestructura', costo: 3500000, mes: 1 },
  { id: 4, nombre: 'Sistema LIS (laboratorio)', categoria: 'TI y Software', costo: 1200000, mes: 2 },
  { id: 5, nombre: 'Sillas y camilla', categoria: 'Mobiliario', costo: 680000, mes: 2 },
  { id: 6, nombre: 'EPP stock inicial', categoria: 'Equipamiento', costo: 320000, mes: 1 },
]

const fmt = (n) => n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

const ITEMS_INICIAL_STATE = (() => {
  const it = loadSaved().items
  return Array.isArray(it) && it.length ? it : ITEMS_INICIALES
})()
let nextId = Math.max(0, ...ITEMS_INICIAL_STATE.map(i => Number(i.id) || 0)) + 1

export default function PlanificadorCapex() {
  const [items, setItems] = useState(ITEMS_INICIAL_STATE)
  const [nuevo, setNuevo] = useState({ nombre: '', categoria: 'Equipamiento', costo: '', mes: 1 })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ items })) } catch { /* noop */ }
  }, [items])

  const agregar = () => {
    if (!nuevo.nombre || !nuevo.costo) return
    setItems(prev => [...prev, { ...nuevo, id: nextId++, costo: Number(nuevo.costo) }])
    setNuevo({ nombre: '', categoria: 'Equipamiento', costo: '', mes: 1 })
  }

  const eliminar = (id) => setItems(prev => prev.filter(i => i.id !== id))

  const total = useMemo(() => items.reduce((s, i) => s + i.costo, 0), [items])

  const porCategoria = useMemo(() => {
    const map = {}
    items.forEach(i => { map[i.categoria] = (map[i.categoria] || 0) + i.costo })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [items])

  return (
    <div className="modulo">
      <h2>Planificador CAPEX</h2>
      <p className="subtitulo">Inversión inicial para habilitación de la unidad</p>

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
                  <td><span className="badge" style={{ background: CATEGORIAS_COLOR[item.categoria] }}>{item.categoria}</span></td>
                  <td>M{item.mes}</td>
                  <td>{fmt(item.costo)}</td>
                  <td><button className="btn-eliminar" onClick={() => eliminar(item.id)}>✕</button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan={3}><strong>Total CAPEX</strong></td><td colSpan={2}><strong>{fmt(total)}</strong></td></tr>
            </tfoot>
          </table>

          <div className="form-agregar">
            <input placeholder="Nombre del ítem" value={nuevo.nombre} onChange={e => setNuevo(p => ({ ...p, nombre: e.target.value }))} />
            <select value={nuevo.categoria} onChange={e => setNuevo(p => ({ ...p, categoria: e.target.value }))}>
              {Object.keys(CATEGORIAS_COLOR).map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Costo $" value={nuevo.costo} onChange={e => setNuevo(p => ({ ...p, costo: e.target.value }))} />
            <input type="number" placeholder="Mes" min="1" max="12" value={nuevo.mes} onChange={e => setNuevo(p => ({ ...p, mes: Number(e.target.value) }))} />
            <button className="btn-primario" onClick={agregar}>Agregar</button>
          </div>
        </div>

        <div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={porCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {porCategoria.map(entry => (
                  <Cell key={entry.name} fill={CATEGORIAS_COLOR[entry.name] ?? '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
