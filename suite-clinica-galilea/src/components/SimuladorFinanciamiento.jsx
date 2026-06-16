import { useState, useMemo, useEffect } from "react";

const STORAGE_KEY = "simulador_financiamiento_v1";

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

const INSTRUMENTS = {
  sercotec: {
    id: "sercotec",
    name: "Sercotec Capital Semilla",
    color: "#34d399",
    icon: "🌱",
    type: "Subsidio (no se devuelve)",
    maxAmount: 6000000,
    requiresPN: true,
    timeline: "3-4 meses postulación + ejecución",
    requirements: [
      "Persona natural sin Inicio de Actividades en 1era categoría",
      "Plan de negocio detallado",
      "Capacitación obligatoria",
      "Cofinanciamiento mínimo 20% del proyecto",
    ],
    notes: "🚨 CRÍTICO: Debes postular ANTES de constituir tu SpA. Una vez ganado, abres la SpA.",
  },
  corfo: {
    id: "corfo",
    name: "CORFO Inicia",
    color: "#38bdf8",
    icon: "🚀",
    type: "Subsidio + cofinanciamiento",
    maxAmount: 15000000,
    requiresPN: false,
    timeline: "4-6 meses postulación + ejecución",
    requirements: [
      "Empresa con menos de 12 meses desde Inicio de Actividades",
      "Proyecto con componente innovador (salud = innovación)",
      "Cofinanciamiento 25%",
      "Plan de negocio detallado",
    ],
    notes: "Salud preventiva en zona desatendida califica como innovación. Considera línea de innovación regional.",
  },
  bancoestado: {
    id: "bancoestado",
    name: "BancoEstado MiPYME + FOGAPE",
    color: "#fbbf24",
    icon: "🏦",
    type: "Crédito comercial",
    maxAmount: 20000000,
    requiresPN: false,
    timeline: "30-45 días aprobación",
    requirements: [
      "Empresa constituida con inicio de actividades",
      "Garantía FOGAPE cubre hasta 80%",
      "Tasa preferencial PYME (8-12% anual aprox)",
      "Plazo hasta 5 años",
    ],
    notes: "Mejor opción para capital de trabajo y compras grandes. Combina con FOGAPE para minimizar garantías personales.",
  },
};

const FASES = [
  { mes: 1, nombre: "Postulación Sercotec (Persona Natural)" },
  { mes: 2, nombre: "Espera resolución Sercotec" },
  { mes: 3, nombre: "Resolución + constitución SpA" },
  { mes: 4, nombre: "Postulación CORFO + BancoEstado" },
  { mes: 5, nombre: "Aprobación crédito + ejecución compras" },
  { mes: 6, nombre: "Habilitación SEREMI + apertura" },
];

const fmtCLP = (n) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(n).toLocaleString("es-CL")}`;
};
const fmtFull = (n) => `$${Math.round(n).toLocaleString("es-CL")}`;

export default function SimuladorFinanciamiento() {
  const [inversionTotal, setInversionTotal] = useState(() => typeof loadSaved().inversionTotal === "number" ? loadSaved().inversionTotal : 14000000);
  const [capitalPropio, setCapitalPropio] = useState(() => typeof loadSaved().capitalPropio === "number" ? loadSaved().capitalPropio : 2000000);
  const [montos, setMontos] = useState(() => loadSaved().montos ?? { sercotec: 5000000, corfo: 0, bancoestado: 7000000 });
  const [tasaCredito, setTasaCredito] = useState(() => typeof loadSaved().tasaCredito === "number" ? loadSaved().tasaCredito : 11);
  const [plazoMeses, setPlazoMeses] = useState(() => typeof loadSaved().plazoMeses === "number" ? loadSaved().plazoMeses : 48);
  const [view, setView] = useState("mix");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        inversionTotal, capitalPropio, montos, tasaCredito, plazoMeses,
      }));
    } catch { /* noop */ }
  }, [inversionTotal, capitalPropio, montos, tasaCredito, plazoMeses]);

  const updateMonto = (key, val) => {
    setMontos((prev) => ({ ...prev, [key]: Number(val) || 0 }));
  };

  const calc = useMemo(() => {
    const totalFinanciado = montos.sercotec + montos.corfo + montos.bancoestado + capitalPropio;
    const gap = inversionTotal - totalFinanciado;

    // Crédito BancoEstado - calculo de cuota mensual (sistema francés)
    const tasaMensual = tasaCredito / 100 / 12;
    let cuotaMensual = 0;
    if (montos.bancoestado > 0 && tasaMensual > 0) {
      cuotaMensual = (montos.bancoestado * tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) /
        (Math.pow(1 + tasaMensual, plazoMeses) - 1);
    }
    const interesesTotales = (cuotaMensual * plazoMeses) - montos.bancoestado;
    const costoTotalCredito = montos.bancoestado + interesesTotales;

    const subsidios = montos.sercotec + montos.corfo;
    const subsidioPct = inversionTotal > 0 ? (subsidios / inversionTotal) * 100 : 0;

    return {
      totalFinanciado, gap, cuotaMensual, interesesTotales,
      costoTotalCredito, subsidios, subsidioPct,
    };
  }, [montos, inversionTotal, capitalPropio, tasaCredito, plazoMeses]);

  const breakdown = [
    { id: "capitalPropio", label: "Capital propio", value: capitalPropio, color: "#7aaec8" },
    { id: "sercotec", label: "Sercotec", value: montos.sercotec, color: "#34d399" },
    { id: "corfo", label: "CORFO", value: montos.corfo, color: "#38bdf8" },
    { id: "bancoestado", label: "BancoEstado", value: montos.bancoestado, color: "#fbbf24" },
  ];

  return (
    <div style={styles.root}>
      <div style={styles.bg} />
      <header style={styles.header}>
        <div style={styles.badge}>Sercotec · CORFO · BancoEstado</div>
        <h1 style={styles.title}>Mix Óptimo de Financiamiento</h1>
        <p style={styles.subtitle}>Minimiza capital propio y costo financiero total</p>

        {/* Inversión total + capital propio */}
        <div style={styles.inputCard}>
          <Slider label="Inversión total requerida" value={inversionTotal} min={5000000} max={30000000} step={500000}
            onChange={setInversionTotal} format={fmtCLP} color="#fbbf24" />
          <Slider label="Capital propio disponible" value={capitalPropio} min={0} max={15000000} step={250000}
            onChange={setCapitalPropio} format={fmtCLP} color="#7aaec8" />
        </div>

        {/* Resumen */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryRow}>
            <div>
              <div style={styles.summaryLabel}>Cubierto</div>
              <div style={{ ...styles.summaryValue, color: "#34d399" }}>{fmtCLP(calc.totalFinanciado)}</div>
            </div>
            <div>
              <div style={styles.summaryLabel}>Faltante</div>
              <div style={{
                ...styles.summaryValue,
                color: Math.abs(calc.gap) < 100000 ? "#34d399" : calc.gap > 0 ? "#f87171" : "#a78bfa",
              }}>
                {calc.gap > 0 ? fmtCLP(calc.gap) : Math.abs(calc.gap) < 100000 ? "✓ Listo" : `+${fmtCLP(-calc.gap)} extra`}
              </div>
            </div>
            <div>
              <div style={styles.summaryLabel}>Subsidio</div>
              <div style={{ ...styles.summaryValue, color: "#34d399" }}>{calc.subsidioPct.toFixed(0)}%</div>
            </div>
          </div>
          <div style={styles.stackBar}>
            {breakdown.filter((b) => b.value > 0).map((b) => {
              const pct = (b.value / Math.max(inversionTotal, calc.totalFinanciado)) * 100;
              return (
                <div key={b.id} style={{ width: `${pct}%`, background: b.color, height: "100%" }} title={`${b.label}: ${fmtCLP(b.value)}`} />
              );
            })}
          </div>
          <div style={styles.legend}>
            {breakdown.filter((b) => b.value > 0).map((b) => (
              <div key={b.id} style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: b.color }} />
                <span style={styles.legendName}>{b.label}</span>
                <span style={styles.legendValue}>{fmtCLP(b.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.tabs}>
          <button onClick={() => setView("mix")} style={{ ...styles.tab, ...(view === "mix" ? styles.tabActive : {}) }}>
            Mix
          </button>
          <button onClick={() => setView("credito")} style={{ ...styles.tab, ...(view === "credito" ? styles.tabActive : {}) }}>
            Crédito
          </button>
          <button onClick={() => setView("timeline")} style={{ ...styles.tab, ...(view === "timeline" ? styles.tabActive : {}) }}>
            Timeline
          </button>
        </div>

        {view === "mix" && (
          <>
            {Object.values(INSTRUMENTS).map((inst) => (
              <div key={inst.id} style={{ ...styles.instCard, borderColor: `${inst.color}40` }}>
                <div style={styles.instHeader}>
                  <span style={{ fontSize: 28 }}>{inst.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...styles.instName, color: inst.color }}>{inst.name}</div>
                    <div style={styles.instType}>{inst.type}</div>
                  </div>
                  <div style={styles.instMax}>
                    <span style={styles.instMaxLabel}>Tope</span>
                    <span style={{ ...styles.instMaxValue, color: inst.color }}>{fmtCLP(inst.maxAmount)}</span>
                  </div>
                </div>
                <Slider value={montos[inst.id] || 0} min={0} max={inst.maxAmount} step={100000}
                  onChange={(v) => updateMonto(inst.id, v)} format={fmtCLP} color={inst.color} />
                <ul style={styles.reqList}>
                  {inst.requirements.map((r, idx) => (
                    <li key={idx} style={styles.reqItem}>{r}</li>
                  ))}
                </ul>
                {inst.notes && (
                  <div style={{ ...styles.noteBox, borderLeft: `3px solid ${inst.color}` }}>
                    {inst.notes}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {view === "credito" && (
          <div style={styles.creditCard}>
            <div style={styles.creditTitle}>📊 Simulador del crédito BancoEstado</div>

            <div style={styles.creditSliders}>
              <Slider label={`Tasa anual: ${tasaCredito}%`} value={tasaCredito} min={6} max={20} step={0.5}
                onChange={setTasaCredito} color="#fbbf24" />
              <Slider label={`Plazo: ${plazoMeses} meses (${(plazoMeses / 12).toFixed(0)} años)`}
                value={plazoMeses} min={12} max={84} step={6}
                onChange={setPlazoMeses} color="#fbbf24" />
            </div>

            <div style={styles.creditResults}>
              <div style={styles.creditRow}>
                <span style={styles.creditLabel}>Monto solicitado</span>
                <strong style={{ color: "#cde4f5" }}>{fmtFull(montos.bancoestado)}</strong>
              </div>
              <div style={styles.creditRow}>
                <span style={styles.creditLabel}>Cuota mensual</span>
                <strong style={{ color: "#fbbf24", fontSize: 16 }}>{fmtFull(calc.cuotaMensual)}</strong>
              </div>
              <div style={styles.creditRow}>
                <span style={styles.creditLabel}>Intereses totales</span>
                <strong style={{ color: "#f87171" }}>{fmtFull(calc.interesesTotales)}</strong>
              </div>
              <div style={styles.creditRow}>
                <span style={styles.creditLabel}>Costo total del crédito</span>
                <strong style={{ color: "#cde4f5" }}>{fmtFull(calc.costoTotalCredito)}</strong>
              </div>
            </div>

            <div style={styles.tipCard}>
              <div style={styles.tipTitle}>💡 Sobre tu capacidad de pago</div>
              <div style={styles.tipText}>
                Tu simulador de ingresos proyecta una utilidad operacional desde mes 1.
                Asegúrate que la cuota mensual no supere el 30% de tu utilidad operacional estimada
                para mantener flexibilidad financiera.
              </div>
            </div>
          </div>
        )}

        {view === "timeline" && (
          <div style={styles.timelineCard}>
            <div style={styles.creditTitle}>📅 Secuencia óptima de postulación</div>

            <div style={styles.criticalAlert}>
              ⚠️ <strong>Regla crítica:</strong> Sercotec EXIGE postular como Persona Natural sin Inicio de Actividades en 1era categoría.
              Si abres tu SpA antes, quedas inhabilitado para postular.
            </div>

            <div style={styles.timeline}>
              {FASES.map((fase, idx) => (
                <div key={fase.mes} style={styles.timelineRow}>
                  <div style={styles.timelineLeft}>
                    <div style={styles.timelineMes}>M{fase.mes}</div>
                    {idx < FASES.length - 1 && <div style={styles.timelineLine} />}
                  </div>
                  <div style={styles.timelineRight}>
                    <div style={styles.timelineFase}>{fase.nombre}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.tipCard}>
              <div style={styles.tipTitle}>🎯 Recomendación de mix</div>
              <div style={styles.tipText}>
                Para una inversión de ~$14M, un mix balanceado típico es:<br/>
                <strong style={{ color: "#34d399" }}>$5M Sercotec</strong> (subsidio) +
                <strong style={{ color: "#fbbf24" }}> $7M BancoEstado</strong> con FOGAPE +
                <strong style={{ color: "#7aaec8" }}> $2M capital propio</strong>.<br/><br/>
                Si pasas Sercotec, postula CORFO Inicia en mes 5-6 para reforzar capital de trabajo.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, format, color = "#38bdf8" }) {
  return (
    <div style={styles.sliderWrap}>
      {label && <div style={styles.sliderHeader}>
        <span style={styles.sliderLabel}>{label}</span>
        {format && <span style={{ ...styles.sliderValue, color }}>{format(value)}</span>}
      </div>}
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ...styles.slider, accentColor: color }} />
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#050f1e", fontFamily: "'DM Sans', sans-serif", color: "#cde4f5", position: "relative" },
  bg: { position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 20% 0%, #2a2a0a 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, #0a3a2a 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 },
  header: { position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "2rem 1rem 1.5rem" },
  badge: { display: "inline-block", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 4, padding: "2px 8px", marginBottom: 8 },
  title: { fontSize: "1.9rem", fontWeight: 800, margin: 0, color: "#e8f4ff", letterSpacing: "-0.02em", lineHeight: 1.1 },
  subtitle: { fontSize: 13, color: "#5a8aaa", margin: "4px 0 1.25rem" },
  inputCard: { background: "rgba(10,25,48,0.6)", border: "1px solid #0e2a45", borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column", gap: 14, marginBottom: "1rem" },
  summaryCard: { background: "linear-gradient(135deg, rgba(251,191,36,0.06), rgba(10,25,48,0.7))", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 14, padding: "1rem" },
  summaryRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: "0.75rem" },
  summaryLabel: { fontSize: 9, color: "#5a8aaa", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: 800, fontVariantNumeric: "tabular-nums", lineHeight: 1 },
  stackBar: { height: 12, background: "#0e2a45", borderRadius: 4, overflow: "hidden", display: "flex", marginBottom: 10 },
  legend: { display: "flex", flexDirection: "column", gap: 4 },
  legendItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 11 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendName: { flex: 1, color: "#b8d4e8" },
  legendValue: { color: "#cde4f5", fontWeight: 700, fontVariantNumeric: "tabular-nums" },
  main: { position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "0 1rem 3rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  tabs: { display: "flex", gap: 4, padding: 4, background: "rgba(10,25,48,0.5)", borderRadius: 10, border: "1px solid #0e2a45" },
  tab: { flex: 1, background: "transparent", border: "none", padding: "8px 12px", fontSize: 12, color: "#5a8aaa", cursor: "pointer", borderRadius: 6, fontWeight: 600, fontFamily: "inherit" },
  tabActive: { background: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  instCard: { background: "rgba(10,25,48,0.6)", border: "1px solid", borderRadius: 12, padding: "1rem" },
  instHeader: { display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 },
  instName: { fontSize: 14, fontWeight: 800 },
  instType: { fontSize: 10, color: "#5a8aaa", marginTop: 2 },
  instMax: { display: "flex", flexDirection: "column", alignItems: "flex-end" },
  instMaxLabel: { fontSize: 9, color: "#5a8aaa", textTransform: "uppercase" },
  instMaxValue: { fontSize: 13, fontWeight: 800, fontVariantNumeric: "tabular-nums" },
  reqList: { listStyle: "none", padding: 0, margin: "0.85rem 0 0", display: "flex", flexDirection: "column", gap: 4 },
  reqItem: { fontSize: 11, color: "#b8d4e8", paddingLeft: 14, position: "relative", lineHeight: 1.5 },
  noteBox: { fontSize: 11, color: "#cde4f5", background: "rgba(5,15,30,0.4)", padding: "8px 10px", marginTop: "0.85rem", borderRadius: 4, lineHeight: 1.5 },
  sliderWrap: { display: "flex", flexDirection: "column", gap: 6 },
  sliderHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  sliderLabel: { fontSize: 12, color: "#cde4f5" },
  sliderValue: { fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" },
  slider: { width: "100%", cursor: "pointer", height: 4 },
  creditCard: { background: "rgba(10,25,48,0.6)", border: "1px solid #0e2a45", borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" },
  creditTitle: { fontSize: 13, fontWeight: 700, color: "#e8f4ff", marginBottom: 4 },
  creditSliders: { display: "flex", flexDirection: "column", gap: 14 },
  creditResults: { background: "rgba(5,15,30,0.5)", borderRadius: 8, padding: "0.85rem" },
  creditRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: 13 },
  creditLabel: { color: "#7aaec8" },
  tipCard: { background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10, padding: "0.85rem" },
  tipTitle: { fontSize: 12, fontWeight: 700, color: "#38bdf8", marginBottom: 6 },
  tipText: { fontSize: 12, color: "#cde4f5", lineHeight: 1.6 },
  timelineCard: { background: "rgba(10,25,48,0.6)", border: "1px solid #0e2a45", borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" },
  criticalAlert: { background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "0.85rem", fontSize: 12, color: "#f87171", lineHeight: 1.6 },
  timeline: { display: "flex", flexDirection: "column", gap: 0 },
  timelineRow: { display: "flex", gap: 12, minHeight: 50 },
  timelineLeft: { display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 },
  timelineMes: { background: "rgba(251,191,36,0.15)", border: "2px solid #fbbf24", color: "#fbbf24", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 },
  timelineLine: { flex: 1, width: 2, background: "#0e2a45", marginTop: 4 },
  timelineRight: { flex: 1, paddingTop: 8 },
  timelineFase: { fontSize: 13, color: "#cde4f5", fontWeight: 600 },
};
