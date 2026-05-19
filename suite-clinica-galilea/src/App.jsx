import { useState } from 'react'
import ChecklistHabilitacion from './components/ChecklistHabilitacion'
import SimuladorIngresos from './components/SimuladorIngresos'
import MonitorCrecimiento from './components/MonitorCrecimiento'
import PlanificadorCapex from './components/PlanificadorCapex'
import CronogramaHabilitacion from './components/CronogramaHabilitacion'
import CalculadoraFonasa from './components/CalculadoraFonasa'
import './App.css'

const MODULOS = [
  { id: 'checklist', label: 'Checklist', componente: ChecklistHabilitacion },
  { id: 'ingresos', label: 'Simulador Ingresos', componente: SimuladorIngresos },
  { id: 'crecimiento', label: 'Monitor Crecimiento', componente: MonitorCrecimiento },
  { id: 'capex', label: 'CAPEX', componente: PlanificadorCapex },
  { id: 'cronograma', label: 'Cronograma', componente: CronogramaHabilitacion },
  { id: 'fonasa', label: 'Calculadora FONASA', componente: CalculadoraFonasa },
]

export default function App() {
  const [activo, setActivo] = useState('checklist')
  const Componente = MODULOS.find(m => m.id === activo)?.componente

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo">
            <span className="logo-icono">⚕</span>
            <div>
              <h1>Clínica Galilea</h1>
              <p>Suite de Habilitación — Unidad de Toma de Muestras</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        {MODULOS.map(m => (
          <button
            key={m.id}
            className={`nav-tab ${activo === m.id ? 'activo' : ''}`}
            onClick={() => setActivo(m.id)}
          >
            {m.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {Componente && <Componente />}
      </main>
    </div>
  )
}
