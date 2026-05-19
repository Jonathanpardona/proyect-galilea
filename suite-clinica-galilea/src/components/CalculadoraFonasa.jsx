import { useState, useMemo } from 'react'

const TRAMOS = [
  { tramo: 'A', descripcion: 'Indigente / sin ingresos', copago: 0 },
  { tramo: 'B', descripcion: 'Renta ≤ $370.000', copago: 0 },
  { tramo: 'C', descripcion: 'Renta $370.001 – $524.000', copago: 10 },
  { tramo: 'D', descripcion: 'Renta > $524.000', copago: 20 },
]

const PRESTACIONES = [
  { codigo: '03.01.001', nombre: 'Hemograma', valorBase: 4890 },
  { codigo: '03.01.002', nombre: 'VHS', valorBase: 2100 },
  { codigo: '03.01.010', nombre: 'Glicemia', valorBase: 2950 },
  { codigo: '03.01.015', nombre: 'Perfil lipídico', valorBase: 7800 },
  { codigo: '03.01.020', nombre: 'Creatinina', valorBase: 3100 },
  { codigo: '03.01.030', nombre: 'TSH', valorBase: 6900 },
  { codigo: '03.01.035', nombre: 'T4 libre', valorBase: 5800 },
  { codigo: '03.01.040', nombre: 'Orina completa', valorBase: 3200 },
  { codigo: '03.01.050', nombre: 'Urocultivo', valorBase: 9500 },
  { codigo: '03.01.060', nombre: 'PCR cuantitativa', valorBase: 4500 },
]

const fmt = (n) => n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

export default function CalculadoraFonasa() {
  const [tramo, setTramo] = useState('B')
  const [seleccion, setSeleccion] = useState({})

  const tramoActual = TRAMOS.find(t => t.tramo === tramo)

  const toggle = (codigo) =>
    setSeleccion(prev => ({ ...prev, [codigo]: !prev[codigo] }))

  const seleccionadas = PRESTACIONES.filter(p => seleccion[p.codigo])

  const resumen = useMemo(() => {
    const totalBase = seleccionadas.reduce((s, p) => s + p.valorBase, 0)
    const totalFonasa = totalBase
    const copagoPct = tramoActual.copago / 100
    const copagoPaciente = Math.round(totalBase * copagoPct)
    const cubierto = totalBase - copagoPaciente
    return { totalBase, copagoPaciente, cubierto }
  }, [seleccionadas, tramoActual])

  return (
    <div className="modulo">
      <h2>Calculadora FONASA</h2>
      <p className="subtitulo">Cálculo de copago por tramo para prestaciones de laboratorio</p>

      <div className="tramo-selector">
        {TRAMOS.map(t => (
          <button
            key={t.tramo}
            className={`btn-tramo ${tramo === t.tramo ? 'activo' : ''}`}
            onClick={() => setTramo(t.tramo)}
          >
            <strong>Tramo {t.tramo}</strong>
            <small>{t.descripcion}</small>
            <span className="copago-badge">{t.copago}% copago</span>
          </button>
        ))}
      </div>

      <div className="grid-2">
        <div>
          <h3>Seleccionar prestaciones</h3>
          {PRESTACIONES.map(p => (
            <label key={p.codigo} className={`checklist-item ${seleccion[p.codigo] ? 'checked' : ''}`}>
              <input
                type="checkbox"
                checked={!!seleccion[p.codigo]}
                onChange={() => toggle(p.codigo)}
              />
              <span className="prestacion-info">
                <span>{p.nombre}</span>
                <small>{p.codigo}</small>
              </span>
              <span className="prestacion-precio">{fmt(p.valorBase)}</span>
            </label>
          ))}
        </div>

        <div>
          <h3>Resumen de cobro</h3>
          {seleccionadas.length === 0 ? (
            <p className="vacio">Selecciona prestaciones para calcular</p>
          ) : (
            <>
              <table className="tabla">
                <tbody>
                  {seleccionadas.map(p => (
                    <tr key={p.codigo}>
                      <td>{p.nombre}</td>
                      <td>{fmt(p.valorBase)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="resumen-fonasa">
                <div className="resumen-fila">
                  <span>Total prestaciones</span>
                  <strong>{fmt(resumen.totalBase)}</strong>
                </div>
                <div className="resumen-fila verde">
                  <span>Cubre FONASA (Tramo {tramo})</span>
                  <strong>{fmt(resumen.cubierto)}</strong>
                </div>
                <div className="resumen-fila naranja">
                  <span>Copago paciente ({tramoActual.copago}%)</span>
                  <strong>{fmt(resumen.copagoPaciente)}</strong>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
