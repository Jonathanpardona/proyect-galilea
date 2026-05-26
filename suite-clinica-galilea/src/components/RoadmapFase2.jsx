import { useState, useMemo, useEffect } from "react";

const STORAGE_KEY = "roadmap_fase2_v1";

// Triggers that signal readiness to evolve
const TRIGGERS = [
  {
    id: "ingreso_estable",
    label: "Ingreso mensual estable ≥ $5M (3 meses consecutivos)",
    description: "Tu toma de muestras tiene flujo de caja predecible para sostener una expansión.",
    weight: 25,
  },
  {
    id: "ocupacion",
    label: "Ocupación local ≥ 70%",
    description: "El espacio se está usando intensivamente. Hora de agregar valor.",
    weight: 20,
  },
  {
    id: "derivaciones",
    label: "Derivaciones espontáneas a especialistas ≥ 20/mes",
    description: "Los pacientes ya te preguntan por médicos. Hay demanda latente.",
    weight: 15,
  },
  {
    id: "convenios",
    label: "Convenios activos con 2+ ISAPRE",
    description: "Tienes cobertura previsional consolidada para sostener consultas.",
    weight: 10,
  },
  {
    id: "b2b",
    label: "Pipeline B2B con ≥ 3 contratos cerrados",
    description: "El canal corporativo demanda evaluaciones médicas completas.",
    weight: 10,
  },
  {
    id: "personal",
    label: "Equipo operativo estable (DT + 2 TENS)",
    description: "No estás operando con personal mínimo.",
    weight: 5,
  },
  {
    id: "deuda",
    label: "Crédito BancoEstado reducido a < 50%",
    description: "Capacidad de endeudamiento liberada para reinversión.",
    weight: 10,
  },
  {
    id: "ubicacion",
    label: "Local con capacidad de expansión física",
    description: "Posibilidad de tomar contigüo o ampliar.",
    weight: 5,
  },
];

// Expansion modules
const MODULES = [
  {
    id: "medicina_general",
    title: "Medicina General",
    icon: "👩‍⚕️",
    color: "#10b981",
    priority: 1,
    invest: 2500000,
    monthlyRevenue: 2800000,
    monthlyCost: 1800000,
    paybackMonths: 3,
    requirements: [
      "Médico general 4-6 hrs/día",
      "Box clínico con camilla, escritorio, instrumental básico",
      "Modificación autorización sanitaria SEREMI",
      "Convenio FONASA Modalidad Libre Elección",
    ],
    synergy: "Genera derivaciones internas a exámenes (cross-selling natural)",
    risk: "bajo",
  },
  {
    id: "matrona",
    title: "Matrona",
    icon: "🤰",
    color: "#ec4899",
    priority: 2,
    invest: 1500000,
    monthlyRevenue: 1800000,
    monthlyCost: 1100000,
    paybackMonths: 4,
    requirements: [
      "Matrona habilitada 4 hrs/día",
      "Ecógrafo básico (puede ser arriendo inicial)",
      "Box ginecológico habilitado",
    ],
    synergy: "Atrae mujeres 20-50 años (mayor frecuencia médica recurrente)",
    risk: "bajo",
  },
  {
    id: "kinesiologia",
    title: "Kinesiología",
    icon: "🦴",
    color: "#38bdf8",
    priority: 3,
    invest: 3500000,
    monthlyRevenue: 3200000,
    monthlyCost: 1900000,
    paybackMonths: 4,
    requirements: [
      "Kinesiólogo medio tiempo",
      "Sala con camillas, equipos electroterapia",
      "Convenios mutuales (alta rentabilidad)",
      "Convenio Modalidad Libre Elección FONASA",
    ],
    synergy: "Tickets repetitivos (sesiones), excelente para B2B accidentados",
    risk: "medio",
  },
  {
    id: "cardiologia",
    title: "Cardiología (con ECG/Holter)",
    icon: "❤️",
    color: "#ef4444",
    priority: 4,
    invest: 5500000,
    monthlyRevenue: 3500000,
    monthlyCost: 1500000,
    paybackMonths: 6,
    requirements: [
      "Cardiólogo 1-2 días/semana",
      "Electrocardiógrafo y Holter ambulatorio",
      "Convenios ISAPRE con cobertura",
    ],
    synergy: "Alto ticket, demanda creciente en mayores de 50. Sinergia perfil lipídico.",
    risk: "medio",
  },
  {
    id: "pediatria",
    title: "Pediatría",
    icon: "👶",
    color: "#fbbf24",
    priority: 5,
    invest: 1800000,
    monthlyRevenue: 2200000,
    monthlyCost: 1400000,
    paybackMonths: 5,
    requirements: [
      "Pediatra horarios extendidos (tardes)",
      "Box ambientado",
      "Convenio ISAPRE",
    ],
    synergy: "Genera demanda familiar completa, fideliza por décadas",
    risk: "medio",
  },
  {
    id: "ecografias",
    title: "Ecografías Generales",
    icon: "🔍",
    color: "#a78bfa",
    priority: 6,
    invest: 8500000,
    monthlyRevenue: 4500000,
    monthlyCost: 2000000,
    paybackMonths: 8,
    requirements: [
      "Ecógrafo de gama media-alta",
      "Radiólogo/imagenólogo (puede ser tele-informe)",
      "Sala oscurecida adecuada",
      "Autorización sanitaria modificada",
    ],
    synergy: "Alto ticket, autonomía creciente. Apoyo a medicina general/cardio.",
    risk: "alto",
  },
];

const fmtCLP = (n) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(n).toLocaleString("es-CL")}`;
};

export default function RoadmapFase2() {
  const [completados, setCompletados] = useState({});
  const [selectedModules, setSelectedModules] = useState({});
  const [view, setView] = useState("triggers");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.completados) setCompletados(p.completados);
        if (p.selectedModules) setSelectedModules(p.selectedModules);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ completados, selectedModules })); } catch {}
  }, [completados, selectedModules, loaded]);

  const toggleTrigger = (id) => setCompletados((p) => ({ ...p, [id]: !p[id] }));
  const toggleModule = (id) => setSelectedModules((p) => ({ ...p, [id]: !p[id] }));

  const readinessScore = useMemo(() => {
    return TRIGGERS.reduce((sum, t) => sum + (completados[t.id] ? t.weight : 0), 0);
  }, [completados]);

  const readinessLevel = useMemo(() => {
    if (readinessScore >= 80) return { level: "Listo", color: "#34d399", msg: "Tu negocio está sólido para expandir. Activa tu plan de evolución." };
    if (readinessScore >= 60) return { level: "Casi listo", color: "#fbbf24", msg: "Estás cerca. Cierra los últimos triggers antes de invertir." };
    if (readinessScore >= 40) return { level: "Consolidando", color: "#38bdf8", msg: "Sigue construyendo base operacional. Evalúa en 6 meses." };
    return { level: "Pre-expansión", color: "#a78bfa", msg: "Foco en estabilizar toma de muestras. Aún no es momento de expandir." };
  }, [readinessScore]);

  const selectedModulesArray = MODULES.filter((m) => selectedModules[m.id]);
  const planStats = useMemo(() => {
    const totalInvest = selectedModulesArray.reduce((s, m) => s + m.invest, 0);
    const monthlyRev = selectedModulesArray.reduce((s, m) => s + m.monthlyRevenue, 0);
    const monthlyMargin = selectedModulesArray.reduce((s, m) => s + (m.monthlyRevenue - m.monthlyCost), 0);
    const avgPayback = selectedModulesArray.length > 0
      ? selectedModulesArray.reduce((s, m) => s + m.paybackMonths, 0) / selectedModulesArray.length
      : 0;
    return { totalInvest, monthlyRev, monthlyMargin, avgPayback };
  }, [selectedModulesArray]);

  return (
    <div style={styles.root}>
      <div style={styles.bg} />
      <header style={styles.header}>
        <div style={styles.badge}>Fase 2 · Evolución a Centro Médico</div>
        <h1 style={styles.title}>Roadmap de Crecimiento</h1>
        <p style={styles.subtitle}>De toma de muestras a policlínico — cuándo y cómo</p>

        <div style={styles.readinessCard}>
          <div style={styles.readinessHeader}>
            <div>
              <div style={styles.readinessLabel}>NIVEL DE PREPARACIÓN</div>
              <div style={{ ...styles.readinessLevel, color: readinessLevel.color }}>{readinessLevel.level}</div>
            </div>
            <div style={styles.scoreRing}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#1e3a5f" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none"
                  stroke={readinessLevel.color} strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - readinessScore / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                  style={{ transition: "stroke-dashoffset 0.6s ease" }} />
                <text x="40" y="46" textAnchor="middle" fill="var(--tx1)" fontSize="18" fontWeight="800">
                  {readinessScore}
                </text>
              </svg>
            </div>
          </div>
          <div style={styles.readinessMsg}>{readinessLevel.msg}</div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.tabs}>
          <button onClick={() => setView("triggers")} style={{ ...styles.tab, ...(view === "triggers" ? styles.tabActive : {}) }}>
            Triggers
          </button>
          <button onClick={() => setView("modulos")} style={{ ...styles.tab, ...(view === "modulos" ? styles.tabActive : {}) }}>
            Módulos
          </button>
          <button onClick={() => setView("plan")} style={{ ...styles.tab, ...(view === "plan" ? styles.tabActive : {}) }}>
            Plan
          </button>
        </div>

        {view === "triggers" && (
          <>
            <div style={styles.intro}>
              Marca cada trigger conforme se vaya cumpliendo. Sobre 80 puntos = listo para expandir.
            </div>
            {TRIGGERS.map((t) => {
              const checked = completados[t.id];
              return (
                <div key={t.id} style={{ ...styles.triggerCard, ...(checked ? styles.triggerCardActive : {}) }}>
                  <button onClick={() => toggleTrigger(t.id)} style={{
                    ...styles.triggerCheck,
                    background: checked ? "#34d399" : "transparent",
                    borderColor: checked ? "#34d399" : "#2a4a6b",
                  }}>
                    {checked && "✓"}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...styles.triggerLabel, opacity: checked ? 0.7 : 1, textDecoration: checked ? "line-through" : "none" }}>
                      {t.label}
                    </div>
                    <div style={styles.triggerDesc}>{t.description}</div>
                  </div>
                  <div style={{
                    ...styles.weight,
                    color: checked ? "#34d399" : "var(--tx2)",
                    borderColor: checked ? "#34d39940" : "var(--bdr2)",
                  }}>+{t.weight}</div>
                </div>
              );
            })}
          </>
        )}

        {view === "modulos" && (
          <>
            <div style={styles.intro}>
              Selecciona los módulos que te interesa incorporar. Ordenados por prioridad estratégica.
            </div>
            {MODULES.map((m) => {
              const isSelected = selectedModules[m.id];
              return (
                <div key={m.id} style={{ ...styles.moduleCard, borderColor: isSelected ? m.color : "var(--bdr)" }}>
                  <button onClick={() => toggleModule(m.id)} style={styles.moduleHeader}>
                    <span style={styles.moduleIcon}>{m.icon}</span>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ ...styles.moduleTitle, color: isSelected ? m.color : "var(--tx1)" }}>
                        {m.title}
                      </div>
                      <div style={styles.modulePriority}>
                        Prioridad {m.priority} · Riesgo {m.risk}
                      </div>
                    </div>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6,
                      border: `2px solid ${isSelected ? m.color : "#2a4a6b"}`,
                      background: isSelected ? m.color : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 14, fontWeight: 800,
                    }}>
                      {isSelected && "✓"}
                    </div>
                  </button>
                  <div style={styles.moduleStats}>
                    <Stat label="Inversión" value={fmtCLP(m.invest)} color="#fbbf24" />
                    <Stat label="Ingreso/mes" value={fmtCLP(m.monthlyRevenue)} color="#34d399" />
                    <Stat label="Margen/mes" value={fmtCLP(m.monthlyRevenue - m.monthlyCost)} color="#38bdf8" />
                    <Stat label="Payback" value={`${m.paybackMonths}m`} color="#a78bfa" />
                  </div>
                  <div style={styles.synergyBox}>
                    <strong style={{ color: m.color }}>🔗 Sinergia:</strong> {m.synergy}
                  </div>
                  {isSelected && (
                    <ul style={styles.reqList}>
                      {m.requirements.map((r, idx) => <li key={idx} style={styles.reqItem}>{r}</li>)}
                    </ul>
                  )}
                </div>
              );
            })}
          </>
        )}

        {view === "plan" && (
          <>
            {selectedModulesArray.length === 0 ? (
              <div style={styles.empty}>
                Selecciona módulos en la pestaña <strong>Módulos</strong> para armar tu plan de expansión.
              </div>
            ) : (
              <>
                <div style={styles.planSummary}>
                  <div style={styles.planTitle}>Tu plan de expansión</div>
                  <div style={styles.planGrid}>
                    <PlanStat label="Inversión total" value={fmtCLP(planStats.totalInvest)} color="#fbbf24" big />
                    <PlanStat label="Ingreso adicional/mes" value={fmtCLP(planStats.monthlyRev)} color="#34d399" big />
                    <PlanStat label="Margen adicional/mes" value={fmtCLP(planStats.monthlyMargin)} color="#38bdf8" />
                    <PlanStat label="Payback promedio" value={`${planStats.avgPayback.toFixed(1)} meses`} color="#a78bfa" />
                  </div>
                </div>

                <div style={styles.planTitle}>Módulos seleccionados ({selectedModulesArray.length})</div>
                {selectedModulesArray.map((m) => (
                  <div key={m.id} style={{ ...styles.moduleSummaryCard, borderLeft: `3px solid ${m.color}` }}>
                    <div style={styles.moduleSummaryHeader}>
                      <span>{m.icon}</span>
                      <strong style={{ color: m.color }}>{m.title}</strong>
                    </div>
                    <div style={styles.moduleSummaryStats}>
                      Inversión <strong>{fmtCLP(m.invest)}</strong> ·
                      Margen <strong style={{ color: "#34d399" }}>{fmtCLP(m.monthlyRevenue - m.monthlyCost)}/mes</strong> ·
                      Payback <strong>{m.paybackMonths}m</strong>
                    </div>
                  </div>
                ))}

                <div style={styles.recommendCard}>
                  <div style={styles.recommendTitle}>💡 Recomendaciones</div>
                  <div style={styles.recommendText}>
                    {readinessScore >= 80 ? (
                      <>Tu negocio está listo. <strong style={{ color: "#34d399" }}>Inicia con medicina general</strong> (menor riesgo, mayor sinergia) y agrega un módulo cada 4-6 meses.</>
                    ) : (
                      <>Aún no alcanzas el umbral de preparación (80 puntos). Sigue consolidando la toma de muestras antes de invertir <strong style={{ color: "#fbbf24" }}>{fmtCLP(planStats.totalInvest)}</strong> en expansión.</>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={styles.stat}>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ ...styles.statValue, color }}>{value}</div>
    </div>
  );
}

function PlanStat({ label, value, color, big }) {
  return (
    <div style={{ ...styles.planStatCard, ...(big ? styles.planStatBig : {}) }}>
      <div style={styles.planStatLabel}>{label}</div>
      <div style={{ ...styles.planStatValue, ...(big ? { fontSize: 22 } : {}), color }}>{value}</div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "linear-gradient(135deg, var(--bg) 0%, var(--bg2) 100%)", fontFamily: "'DM Sans', sans-serif", color: "var(--tx1)", position: "relative" },
  bg: { position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% -10%, var(--glow-c) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 },
  header: { position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "2rem 1rem 1.5rem" },
  badge: { display: "inline-block", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#34d399", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 4, padding: "2px 8px", marginBottom: 8 },
  title: { fontSize: "1.9rem", fontWeight: 800, margin: 0, color: "var(--tx1)", letterSpacing: "-0.02em", lineHeight: 1.1 },
  subtitle: { fontSize: 13, color: "var(--tx2)", margin: "4px 0 1.25rem" },
  readinessCard: { background: "linear-gradient(135deg, rgba(52,211,153,0.06), var(--card))", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 14, padding: "1rem" },
  readinessHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  readinessLabel: { fontSize: 10, color: "var(--tx2)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 },
  readinessLevel: { fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em" },
  scoreRing: { display: "flex", alignItems: "center" },
  readinessMsg: { fontSize: 12, color: "var(--tx1)", lineHeight: 1.5 },
  main: { position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "0 1rem 3rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  tabs: { display: "flex", gap: 4, padding: 4, background: "var(--card)", borderRadius: 10, border: "1px solid var(--bdr)" },
  tab: { flex: 1, background: "transparent", border: "none", padding: "8px 12px", fontSize: 12, color: "var(--tx2)", cursor: "pointer", borderRadius: 6, fontWeight: 600, fontFamily: "inherit" },
  tabActive: { background: "rgba(52,211,153,0.15)", color: "#34d399" },
  intro: { fontSize: 12, color: "var(--tx2)", lineHeight: 1.5, padding: "0.5rem 0.25rem" },
  triggerCard: { display: "flex", alignItems: "flex-start", gap: 12, padding: "0.85rem 1rem", background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10 },
  triggerCardActive: { background: "rgba(52,211,153,0.05)", borderColor: "rgba(52,211,153,0.3)" },
  triggerCheck: { width: 24, height: 24, borderRadius: 6, border: "2px solid", cursor: "pointer", fontFamily: "inherit", color: "#fff", fontSize: 14, fontWeight: 800, flexShrink: 0, marginTop: 2 },
  triggerLabel: { fontSize: 13, color: "var(--tx1)", fontWeight: 600, marginBottom: 4, lineHeight: 1.4 },
  triggerDesc: { fontSize: 11, color: "var(--tx2)", lineHeight: 1.5 },
  weight: { fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 5, border: "1px solid", flexShrink: 0 },
  moduleCard: { background: "var(--card)", border: "1px solid", borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", transition: "border-color 0.2s" },
  moduleHeader: { display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit", fontFamily: "inherit", width: "100%" },
  moduleIcon: { fontSize: 28, flexShrink: 0 },
  moduleTitle: { fontSize: 14, fontWeight: 800 },
  modulePriority: { fontSize: 10, color: "var(--tx2)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 },
  moduleStats: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 },
  stat: { background: "var(--ibg)", borderRadius: 6, padding: "0.5rem" },
  statLabel: { fontSize: 9, color: "var(--tx2)", textTransform: "uppercase", marginBottom: 2 },
  statValue: { fontSize: 12, fontWeight: 800, fontVariantNumeric: "tabular-nums" },
  synergyBox: { fontSize: 11, color: "var(--tx2)", lineHeight: 1.5, background: "var(--ibg)", padding: "6px 10px", borderRadius: 6 },
  reqList: { listStyle: "disc", paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 4 },
  reqItem: { fontSize: 11, color: "var(--tx2)", lineHeight: 1.5 },
  empty: { textAlign: "center", padding: "3rem 1rem", color: "var(--tx2)", fontSize: 12, background: "var(--card)", border: "1px dashed var(--bdr2)", borderRadius: 10 },
  planSummary: { background: "linear-gradient(135deg, rgba(52,211,153,0.06), var(--card))", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 12, padding: "1rem" },
  planTitle: { fontSize: 14, fontWeight: 700, color: "var(--tx1)", marginBottom: "0.75rem" },
  planGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 },
  planStatCard: { background: "var(--ibg)", border: "1px solid var(--bdr)", borderRadius: 8, padding: "0.7rem" },
  planStatBig: { padding: "0.9rem" },
  planStatLabel: { fontSize: 9, color: "var(--tx2)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 },
  planStatValue: { fontSize: 16, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" },
  moduleSummaryCard: { background: "var(--card)", borderRadius: 8, padding: "0.75rem 0.9rem" },
  moduleSummaryHeader: { display: "flex", gap: 8, alignItems: "center", marginBottom: 4, fontSize: 13 },
  moduleSummaryStats: { fontSize: 11, color: "var(--tx2)" },
  recommendCard: { background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10, padding: "0.85rem" },
  recommendTitle: { fontSize: 12, fontWeight: 700, color: "#38bdf8", marginBottom: 6 },
  recommendText: { fontSize: 12, color: "var(--tx1)", lineHeight: 1.6 },
};
