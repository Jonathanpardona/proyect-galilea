import { useState } from 'react'
import ChecklistHabilitacion from './components/ChecklistHabilitacion'
import CronogramaHabilitacion from './components/CronogramaHabilitacion'
import PlanificadorCapex from './components/PlanificadorCapex'
import SimuladorIngresos from './components/SimuladorIngresos'
import CalculadoraFonasa from './components/CalculadoraFonasa'
import SimuladorFinanciamiento from './components/SimuladorFinanciamiento'
import GeneradorDocumentos from './components/GeneradorDocumentos'
import DashboardOperacional from './components/DashboardOperacional'
import MonitorCrecimiento from './components/MonitorCrecimiento'
import ControlStock from './components/ControlStock'
import TrackerREAS from './components/TrackerREAS'
import PipelineB2B from './components/PipelineB2B'
import RoadmapFase2 from './components/RoadmapFase2'
import './App.css'

const MODULOS = [
  // ── Pre-Apertura ─────────────────────────────────────
  {
    id: 'checklist',
    label: 'Checklist Habilitación',
    descripcion: 'Requisitos SEREMI',
    icono: '✅',
    grupo: 'Pre-Apertura',
    componente: ChecklistHabilitacion,
  },
  {
    id: 'cronograma',
    label: 'Cronograma',
    descripcion: 'Gantt de habilitación',
    icono: '📅',
    grupo: 'Pre-Apertura',
    componente: CronogramaHabilitacion,
  },
  {
    id: 'capex',
    label: 'Planificador CAPEX',
    descripcion: 'Inversión inicial',
    icono: '💰',
    grupo: 'Pre-Apertura',
    componente: PlanificadorCapex,
  },
  {
    id: 'simulador',
    label: 'Simulador de Ingresos',
    descripcion: 'Proyección por exámenes',
    icono: '📊',
    grupo: 'Pre-Apertura',
    componente: SimuladorIngresos,
  },
  {
    id: 'fonasa',
    label: 'Calculadora FONASA',
    descripcion: 'Copago por tramo',
    icono: '💵',
    grupo: 'Pre-Apertura',
    componente: CalculadoraFonasa,
  },
  {
    id: 'financ',
    label: 'Simulador Financiamiento',
    descripcion: 'Sercotec + CORFO + BancoEstado',
    icono: '🏦',
    grupo: 'Pre-Apertura',
    componente: SimuladorFinanciamiento,
  },
  {
    id: 'docs',
    label: 'Generador Documentos',
    descripcion: '6 documentos SEREMI',
    icono: '📄',
    grupo: 'Pre-Apertura',
    componente: GeneradorDocumentos,
  },
  // ── Post-Apertura ─────────────────────────────────────
  {
    id: 'dashboard',
    label: 'Dashboard Operacional',
    descripcion: 'KPIs y registro diario',
    icono: '🗂️',
    grupo: 'Post-Apertura',
    componente: DashboardOperacional,
  },
  {
    id: 'monitor',
    label: 'Monitor de Crecimiento',
    descripcion: 'Real vs proyectado',
    icono: '📈',
    grupo: 'Post-Apertura',
    componente: MonitorCrecimiento,
  },
  {
    id: 'stock',
    label: 'Control de Stock',
    descripcion: 'Inventario y alertas',
    icono: '📦',
    grupo: 'Post-Apertura',
    componente: ControlStock,
  },
  {
    id: 'reas',
    label: 'Tracker REAS',
    descripcion: 'Bitácora retiros REAS',
    icono: '♻️',
    grupo: 'Post-Apertura',
    componente: TrackerREAS,
  },
  {
    id: 'b2b',
    label: 'Pipeline B2B',
    descripcion: 'CRM CMPC / Arauco',
    icono: '🤝',
    grupo: 'Post-Apertura',
    componente: PipelineB2B,
  },
  {
    id: 'roadmap',
    label: 'Roadmap Fase 2',
    descripcion: 'Evolución a centro médico',
    icono: '🚀',
    grupo: 'Post-Apertura',
    componente: RoadmapFase2,
  },
]

export default function App() {
  const [activo, setActivo] = useState('checklist')
  const [sidebarAbierto, setSidebarAbierto] = useState(false)
  const [tema, setTema] = useState(() => localStorage.getItem('galilea_tema') ?? 'dark')

  const toggleTema = () => {
    const nuevo = tema === 'dark' ? 'light' : 'dark'
    setTema(nuevo)
    localStorage.setItem('galilea_tema', nuevo)
  }

  const moduloActivo = MODULOS.find(m => m.id === activo)
  const Componente = moduloActivo?.componente

  const navegar = (id) => {
    setActivo(id)
    setSidebarAbierto(false)
  }

  return (
    <div className="app-shell" data-theme={tema}>
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
          {MODULOS.map((m, i) => (
            <div key={m.id}>
              {/* Cabecera de grupo cuando cambia el grupo */}
              {(i === 0 || MODULOS[i - 1].grupo !== m.grupo) && (
                <p className="sidebar-seccion">{m.grupo}</p>
              )}
              <button
                className={`sidebar-item ${activo === m.id ? 'activo' : ''}`}
                onClick={() => navegar(m.id)}
              >
                <span className="sidebar-icono">{m.icono}</span>
                <span className="sidebar-texto">
                  <span className="sidebar-label">{m.label}</span>
                  <span className="sidebar-desc">{m.descripcion}</span>
                </span>
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span>Suite v2.0 · {MODULOS.length} herramientas</span>
        </div>
      </aside>

      {/* Botón día/noche */}
      <button
        className="btn-tema"
        onClick={toggleTema}
        aria-label={tema === 'dark' ? 'Modo día' : 'Modo noche'}
        title={tema === 'dark' ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
      >
        {tema === 'dark' ? '☀️' : '🌙'}
      </button>

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
