import { useState, useMemo, useEffect } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'

const STORAGE_KEY = 'flujo_caja_v1'
const HORIZONTES = [12, 18, 24]

const fmt = (n) =>
  (Number.isFinite(n) ? n : 0).toLocaleString('es-CL', {
    style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
  })
const fmtM = (n) => `$${((Number.isFinite(n) ? n : 0) / 1000000).toFixed(1)}M`

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}
const numOr = (v, def) => typeof v === 'number' ? v : def

export default function FlujoCaja() {
  const [horizonte, setHorizonte] = useState(() => numOr(loadSaved().horizonte, 12))
  const [ingresoObjetivo, setIngresoObjetivo] = useState(() => numOr(loadSaved().ingresoObjetivo, 5500000))
  const [mesApertura, setMesApertura] = useState(() => numOr(loadSaved().mesApertura, 3))
  const [rampInicialPct, setRampInicialPct] = useState(() => numOr(loadSaved().rampInicialPct, 40))
  const [rampMeses, setRampMeses] = useState(() => numOr(loadSaved().rampMeses, 6))
  const [costoVarPct, setCostoVarPct] = useState(() => numOr(loadSaved().costoVarPct, 48))
  const [opexMensual, setOpexMensual] = useState(() => numOr(loadSaved().opexMensual, 2420000))
  const [opexDesdeMes, setOpexDesdeMes] = useState(() => numOr(loadSaved().opexDesdeMes, 1))
  const [capex, setCapex] = useState(() => numOr(loadSaved().capex, 8450000))
  const [mesCapex, setMesCapex] = useState(() => numOr(loadSaved().mesCapex, 2))
  const [capitalPropio, setCapitalPropio] = useState(() => numOr(loadSaved().capitalPropio, 2000000))
  const [subsidios, setSubsidios] = useState(() => numOr(loadSaved().subsidios, 5000000))
  const [mesSubsidio, setMesSubsidio] = useState(() => numOr(loadSaved().mesSubsidio, 2))
  const [credito, setCredito] = useState(() => numOr(loadSaved().credito, 7000000))
  const [mesCredito, setMesCredito] = useState(() => numOr(loadSaved().mesCredito, 2))
  const [tasaAnual, setTasaAnual] = useState(() => numOr(loadSaved().tasaAnual, 11))
  const [plazoMeses, setPlazoMeses] = useState(() => numOr(loadSaved().plazoMeses, 48))

  // ── Persistencia ──────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        horizonte, ingresoObjetivo, mesApertura, rampInicialPct, rampMeses, costoVarPct,
        opexMensual, opexDesdeMes, capex, mesCapex, capitalPropio, subsidios, mesSubsidio,
        credito, mesCredito, tasaAnual, plazoMeses,
      }))
    } catch { /* noop */ }
  }, [horizonte, ingresoObjetivo, mesApertura, rampInicialPct, rampMeses, costoVarPct,
      opexMensual, opexDesdeMes, capex, mesCapex, capitalPropio, subsidios, mesSubsidio,
      credito, mesCredito, tasaAnual, plazoMeses])

  // ── Cálculos ──────────────────────────────────────────
  const calc = useMemo(() => {
    const N = horizonte
    const tm = tasaAnual / 100 / 12
    const cuotaMensual = credito > 0
      ? (tm > 0
        ? (credito * tm * Math.pow(1 + tm, plazoMeses)) / (Math.pow(1 + tm, plazoMeses) - 1)
        : credito / Math.max(1, plazoMeses))
      : 0

    const filasBase = Array.from({ length: N }, (_, i) => {
      const mes = i + 1
      // Ingreso con curva de ramp-up
      let ingresos = 0
      if (mes >= mesApertura) {
        const opMes = mes - mesApertura
        const base = rampInicialPct / 100
        const progreso = Math.min(1, base + (1 - base) * (opMes / Math.max(1, rampMeses)))
        ingresos = ingresoObjetivo * progreso
      }
      const costoVar = ingresos * (costoVarPct / 100)
      const opex = mes >= opexDesdeMes ? opexMensual : 0
      const capexEgreso = mes === mesCapex ? capex : 0
      const cuota = (mes > mesCredito && mes <= mesCredito + plazoMeses && credito > 0) ? cuotaMensual : 0

      const entradas = ingresos
        + (mes === 1 ? capitalPropio : 0)
        + (mes === mesSubsidio ? subsidios : 0)
        + (mes === mesCredito ? credito : 0)
      const salidas = costoVar + opex + capexEgreso + cuota
      return { mes, ingresos, costoVar, opex, capexEgreso, cuota, entradas, salidas, flujo: entradas - salidas }
    })

    // Saldo acumulado (acumulado funcional, sin reasignaciones)
    const filas = filasBase.map((f, i) => ({
      ...f,
      saldo: filasBase.slice(0, i + 1).reduce((s, x) => s + x.flujo, 0),
    }))

    const saldos = filas.map(f => f.saldo)
    const saldoFinal = saldos.length ? saldos[saldos.length - 1] : 0
    const cajaMinima = saldos.length ? Math.min(...saldos) : 0
    const idxMin = saldos.indexOf(cajaMinima)
    const mesCajaMin = idxMin >= 0 ? idxMin + 1 : 0
    const necesidadCT = cajaMinima < 0 ? -cajaMinima : 0
    const filaPos = filas.find(f => f.mes >= mesApertura && f.flujo > 0)
    const mesFlujoPositivo = filaPos ? filaPos.mes : 0

    return { filas, cuotaMensual, saldoFinal, cajaMinima, mesCajaMin, necesidadCT, mesFlujoPositivo }
  }, [horizonte, ingresoObjetivo, mesApertura, rampInicialPct, rampMeses, costoVarPct,
      opexMensual, opexDesdeMes, capex, mesCapex, capitalPropio, subsidios, mesSubsidio,
      credito, mesCredito, tasaAnual, plazoMeses])

  const chartData = calc.filas.map(f => ({
    mes: `M${f.mes}`,
    'Flujo neto': Math.round(f.flujo),
    'Saldo acumulado': Math.round(f.saldo),
  }))

  const sinCT = calc.necesidadCT <= 0

  const num = (v, setter, opts = {}) => (
    <input type="number" value={v} min={opts.min ?? 0} max={opts.max} step={opts.step ?? 1}
      onChange={e => setter(Math.max(opts.min ?? 0, Number(e.target.value) || 0))} />
  )

  return (
    <div className="modulo">
      <h2>Flujo de Caja Proyectado</h2>
      <p className="subtitulo">
        Proyección mes a mes: ramp-up de ingresos, OPEX, CAPEX, financiamiento y caja acumulada
      </p>

      {/* Horizonte */}
      <div className="controles-fila">
        <div className="campo">
          <label>Horizonte</label>
          <div className="rent-escenarios">
            {HORIZONTES.map(h => (
              <button key={h} className={`rent-esc-btn ${horizonte === h ? 'activo' : ''}`}
                style={horizonte === h ? { borderColor: '#3b82f6', color: '#3b82f6', background: '#eff6ff' } : undefined}
                onClick={() => setHorizonte(h)}>
                {h}<small>meses</small>
              </button>
            ))}
          </div>
        </div>
        <div className="campo">
          <label>Ingreso objetivo / mes (régimen)</label>
          {num(ingresoObjetivo, setIngresoObjetivo, { step: 250000 })}
        </div>
        <div className="campo">
          <label>Costo variable (% ingresos)</label>
          {num(costoVarPct, setCostoVarPct, { max: 100 })}
        </div>
        <div className="campo">
          <label>OPEX fijo / mes</label>
          {num(opexMensual, setOpexMensual, { step: 50000 })}
        </div>
      </div>

      <div className="controles-fila">
        <div className="campo">
          <label>Mes de apertura</label>
          {num(mesApertura, setMesApertura, { min: 1, max: horizonte })}
        </div>
        <div className="campo">
          <label>% ingreso en 1.er mes</label>
          {num(rampInicialPct, setRampInicialPct, { max: 100, step: 5 })}
        </div>
        <div className="campo">
          <label>Meses hasta régimen (ramp)</label>
          {num(rampMeses, setRampMeses, { min: 1 })}
        </div>
        <div className="campo">
          <label>OPEX empieza en mes</label>
          {num(opexDesdeMes, setOpexDesdeMes, { min: 1, max: horizonte })}
        </div>
      </div>

      <div className="controles-fila">
        <div className="campo">
          <label>CAPEX total</label>{num(capex, setCapex, { step: 250000 })}
        </div>
        <div className="campo">
          <label>Mes desembolso CAPEX</label>{num(mesCapex, setMesCapex, { min: 1, max: horizonte })}
        </div>
        <div className="campo">
          <label>Capital propio (mes 1)</label>{num(capitalPropio, setCapitalPropio, { step: 250000 })}
        </div>
        <div className="campo">
          <label>Subsidios</label>{num(subsidios, setSubsidios, { step: 250000 })}
        </div>
        <div className="campo">
          <label>Mes subsidios</label>{num(mesSubsidio, setMesSubsidio, { min: 1, max: horizonte })}
        </div>
      </div>

      <div className="controles-fila">
        <div className="campo">
          <label>Crédito</label>{num(credito, setCredito, { step: 250000 })}
        </div>
        <div className="campo">
          <label>Mes desembolso crédito</label>{num(mesCredito, setMesCredito, { min: 1, max: horizonte })}
        </div>
        <div className="campo">
          <label>Tasa anual crédito (%)</label>{num(tasaAnual, setTasaAnual, { step: 0.5 })}
        </div>
        <div className="campo">
          <label>Plazo crédito (meses)</label>{num(plazoMeses, setPlazoMeses, { min: 1 })}
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi" style={{
          background: calc.saldoFinal >= 0 ? '#f0fdf4' : '#fef2f2',
          borderColor: calc.saldoFinal >= 0 ? '#bbf7d0' : '#fecaca',
        }}>
          <span>Saldo de caja final</span>
          <strong style={{ color: calc.saldoFinal >= 0 ? '#15803d' : '#dc2626' }}>{fmt(calc.saldoFinal)}</strong>
        </div>
        <div className="kpi">
          <span>Caja mínima {calc.mesCajaMin ? `(M${calc.mesCajaMin})` : ''}</span>
          <strong style={{ color: calc.cajaMinima >= 0 ? '#1e293b' : '#dc2626' }}>{fmt(calc.cajaMinima)}</strong>
        </div>
        <div className="kpi accent">
          <span>Cuota mensual crédito</span>
          <strong>{fmt(calc.cuotaMensual)}</strong>
        </div>
      </div>

      {/* Estado capital de trabajo */}
      <div className="rent-estado" style={{
        background: sinCT ? '#f0fdf4' : '#fef2f2',
        borderColor: sinCT ? '#bbf7d0' : '#fecaca',
        color: sinCT ? '#15803d' : '#dc2626',
      }}>
        {sinCT ? '✓' : '⚠'}{' '}
        {sinCT
          ? `La caja nunca queda negativa. ${calc.mesFlujoPositivo ? `El flujo mensual se vuelve positivo en el mes ${calc.mesFlujoPositivo}.` : ''}`
          : <>Necesitas <strong>{fmt(calc.necesidadCT)}</strong> adicionales de capital de trabajo: la caja toca su mínimo en el mes {calc.mesCajaMin}. Súbelo vía capital propio, crédito o adelantando ingresos.</>}
      </div>

      {/* Gráfico */}
      <h3 style={{ marginTop: 20 }}>Flujo neto mensual y saldo acumulado</h3>
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" tick={{ fontSize: 11 }} interval={0} />
          <YAxis tickFormatter={fmtM} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => fmt(v)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine y={0} stroke="#94a3b8" />
          <Bar dataKey="Flujo neto" radius={[3, 3, 0, 0]}>
            {chartData.map((d, i) => <Cell key={i} fill={d['Flujo neto'] >= 0 ? '#86efac' : '#fca5a5'} />)}
          </Bar>
          <Line type="monotone" dataKey="Saldo acumulado" stroke="#1e40af" strokeWidth={2.5} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Tabla mes a mes */}
      <h3 style={{ marginTop: 16 }}>Detalle mes a mes</h3>
      <div className="rent-tabla-wrap">
        <table className="tabla">
          <thead>
            <tr>
              <th>Mes</th><th>Ingresos</th><th>Costo var.</th><th>OPEX</th>
              <th>Cuota</th><th>CAPEX</th><th>Flujo neto</th><th>Saldo acum.</th>
            </tr>
          </thead>
          <tbody>
            {calc.filas.map(f => (
              <tr key={f.mes}>
                <td><strong>M{f.mes}</strong></td>
                <td>{fmt(f.ingresos)}</td>
                <td>{fmt(f.costoVar)}</td>
                <td>{fmt(f.opex)}</td>
                <td>{fmt(f.cuota)}</td>
                <td>{f.capexEgreso ? fmt(f.capexEgreso) : '—'}</td>
                <td style={{ color: f.flujo >= 0 ? '#15803d' : '#dc2626', fontWeight: 600 }}>{fmt(f.flujo)}</td>
                <td style={{ color: f.saldo >= 0 ? '#1e293b' : '#dc2626', fontWeight: 700 }}>{fmt(f.saldo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
