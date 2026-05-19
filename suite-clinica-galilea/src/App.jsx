import { useState } from 'react'
import ChecklistHabilitacion from './components/ChecklistHabilitacion'
import SimuladorIngresos from './components/SimuladorIngresos'
import MonitorCrecimiento from './components/MonitorCrecimiento'
import PlanificadorCapex from './components/PlanificadorCapex'
import CronogramaHabilitacion from './components/CronogramaHabilitacion'
import CalculadoraFonasa from './components/CalculadoraFonasa'
import './App.css'

const MODULOS = [
  {
    id: 'checklist',
    label: 'Checklist Habilitación',
    descripcion: 'Requisitos SEREMI',
    icono: '✅',
    componente: ChecklistHabilitacion,
  },
  {
    id: 'ingresos',
    label: 'Simulador de Ingresos',
    descripcion: 'Proyección por exámenes',
    icono: '💰',
    componente: SimuladorIngresos,
  },
  {
    id: 'crecimiento',
    label: 'Monitor de Crecimiento',
    descripcion: 'Real vs proyectado',
    icono: '📈',
    componente: MonitorCrecimiento,
  },
  {
    id: 'capex',
    label: 'Planificador CAPEX',
    descripcion: 'Inversión inicial',
    icono: '🏗️',
    componente: PlanificadorCapex,
  },
  {
    id: 'cronograma',
    label: 'Cronograma',
    descripcion: 'Gantt de habilitación',
    icono: '📅',
    componente: CronogramaHabilitacion,
  },
  {
    id: 'fonasa',
    label: 'Calculadora FONASA',
    descripcion: 'Copago por tramo',
    icono: '🏥',
    componente: CalculadoraFonasa,
  },
]

export default function App() {
  const [activo, setActivo] = useState('checklist')
  const [sidebarAbierto, setSidebarAbierto] = useState(false)

  const moduloActivo = MODULOS.find(m => m.id === activo)
  const Componente = moduloActivo?.componente

  const navegar = (id) => {
    setActivo(id)
    setSidebarAbierto(false)
  }

  return (
    <div className="app-shell">
      {/* Overlay móvil */}
      {sidebarAbierto && (
        <div className="sidebar-overlay" onClick={() => setSidebarAbierto(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarAbierto ? 'abierto' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icono">⚕️</span>
          <div>
            <strong>Clínica Galilea</strong>
            <small>Toma de Muestras</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-seccion">Herramientas</p>
          {MODULOS.map(m => (
            <button
              key={m.id}
              className={`sidebar-item ${activo === m.id ? 'activo' : ''}`}
              onClick={() => navegar(m.id)}
            >
              <span className="sidebar-icono">{m.icono}</span>
              <span className="sidebar-texto">
                <span className="sidebar-label">{m.label}</span>
                <span className="sidebar-desc">{m.descripcion}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span>Suite v1.0</span>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="main-wrap">
        <header className="topbar">
          <button
            className="btn-menu"
            onClick={() => setSidebarAbierto(s => !s)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <div className="topbar-titulo">
            <span>{moduloActivo?.icono}</span>
            <span>{moduloActivo?.label}</span>
          </div>
        </header>

        <main className="contenido">
          {Componente && <Componente />}
        </main>
      </div>
    </div>
  )
}
