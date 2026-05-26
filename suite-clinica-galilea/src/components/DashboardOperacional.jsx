import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const STORAGE_KEY = "dashboard_operacional_v1";

const EXAM_CATALOG = [
  "Hemograma", "Glicemia", "Perfil lipídico", "Perfil hepático", "Creatinina",
  "Orina completa", "HbA1c", "TSH", "Vitamina D", "PSA",
  "VDRL", "Urocultivo", "Pre-ocupacional (B2B)", "Otro",
];

const today = () => new Date().toISOString().slice(0, 10);

export default function DashboardOperacional() {
  const [registros, setRegistros] = useState([]);
  const [fechaActiva, setFechaActiva] = useState(today());
  const [showNew, setShowNew] = useState(false);
  const [view, setView] = useState("dia");
  const [loaded, setLoaded] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.registros) setRegistros(p.registros);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ registros })); } catch {}
  }, [registros, loaded]);

  const addRegistro = (data) => {
    const r = { id: `r${Date.now()}`, fecha: fechaActiva, hora: new Date().toTimeString().slice(0, 5), ...data };
    setRegistros((prev) => [...prev, r]);
    setShowNew(false);
  };

  const deleteRegistro = (id) => {
    if (confirm("¿Eliminar este registro?")) {
      setRegistros((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Día activo
  const registrosHoy = useMemo(() => registros.filter((r) => r.fecha === fechaActiva), [registros, fechaActiva]);

  const statsHoy = useMemo(() => {
    const total = registrosHoy.length;
    const ingreso = registrosHoy.reduce((s, r) => s + (Number(r.monto) || 0), 0);
    const ticket = total > 0 ? ingreso / total : 0;
    const fonasa = registrosHoy.filter((r) => r.previsional === "FONASA").length;
    const particular = registrosHoy.filter((r) => r.previsional === "Particular").length;
    const isapre = registrosHoy.filter((r) => r.previsional === "ISAPRE").length;
    const b2b = registrosHoy.filter((r) => r.previsional === "B2B").length;
    return { total, ingreso, ticket, fonasa, particular, isapre, b2b };
  }, [registrosHoy]);

  // Últimos 7 días
  const ultimos7 = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const fechaStr = d.toISOString().slice(0, 10);
      const regs = registros.filter((r) => r.fecha === fechaStr);
      data.push({
        fecha: fechaStr,
        label: d.toLocaleDateString("es-CL", { weekday: "short", day: "numeric" }),
        pacientes: regs.length,
        ingresos: regs.reduce((s, r) => s + (Number(r.monto) || 0), 0),
      });
    }
    return data;
  }, [registros]);

  // Top exámenes (acumulado)
  const topExamenes = useMemo(() => {
    const counts = {};
    registros.forEach((r) => {
      (r.examenes || []).forEach((e) => {
        counts[e] = (counts[e] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [registros]);

  // Alertas
  const alertas = useMemo(() => {
    const list = [];
    if (statsHoy.total === 0) list.push({ tipo: "info", text: "Sin registros para esta fecha. Registra el primer paciente." });
    else if (statsHoy.total < 5) list.push({ tipo: "warning", text: `Solo ${statsHoy.total} paciente${statsHoy.total > 1 ? "s" : ""} hoy. Día bajo lo habitual.` });
    if (statsHoy.b2b > 0) list.push({ tipo: "success", text: `${statsHoy.b2b} atención${statsHoy.b2b > 1 ? "es" : ""} B2B hoy — segmento estratégico activo.` });

    const promedio7 = ultimos7.reduce((s, d) => s + d.pacientes, 0) / 7;
    if (statsHoy.total > promedio7 * 1.5 && statsHoy.total > 5) {
      list.push({ tipo: "success", text: `Día muy fuerte: ${(statsHoy.total / promedio7 * 100 - 100).toFixed(0)}% sobre promedio semanal.` });
    }
    return list;
  }, [statsHoy, ultimos7]);

  const fmtCLP = (n) => `$${Math.round(n).toLocaleString("es-CL")}`;

  return (
    <div style={styles.root}>
      <div style={styles.bg} />
      <header style={styles.header}>
        <div style={styles.badge}>Operación Diaria</div>
        <h1 style={styles.title}>Dashboard Operacional</h1>
        <p style={styles.subtitle}>Registro paciente a paciente del día</p>

        <div style={styles.dateRow}>
          <input type="date" value={fechaActiva} onChange={(e) => setFechaActiva(e.target.value)}
            style={styles.dateInput} />
          <button onClick={() => setFechaActiva(today())} style={styles.todayBtn}>Hoy</button>
        </div>

        <div style={styles.kpiGrid}>
          <KPI label="Pacientes" value={statsHoy.total} color="#38bdf8" big />
          <KPI label="Ingresos" value={fmtCLP(statsHoy.ingreso)} color="#34d399" big />
        </div>
        <div style={styles.kpiGrid}>
          <KPI label="Ticket" value={fmtCLP(statsHoy.ticket)} color="#a78bfa" />
          <KPI label="FONASA" value={statsHoy.fonasa} color="#fbbf24" />
          <KPI label="B2B" value={statsHoy.b2b} color="#34d399" />
        </div>

        {alertas.length > 0 && (
          <div style={styles.alertList}>
            {alertas.map((a, idx) => (
              <div key={idx} style={{
                ...styles.alert,
                background: a.tipo === "success" ? "rgba(52,211,153,0.08)" : a.tipo === "warning" ? "rgba(251,191,36,0.08)" : "rgba(56,189,248,0.08)",
                borderColor: a.tipo === "success" ? "#34d39940" : a.tipo === "warning" ? "#fbbf2440" : "#38bdf840",
                color: a.tipo === "success" ? "#34d399" : a.tipo === "warning" ? "#fbbf24" : "#38bdf8",
              }}>
                {a.tipo === "success" ? "✓" : a.tipo === "warning" ? "⚠" : "ℹ"} {a.text}
              </div>
            ))}
          </div>
        )}
      </header>

      <main style={styles.main}>
        <div style={styles.tabs}>
          <button onClick={() => setView("dia")} style={{ ...styles.tab, ...(view === "dia" ? styles.tabActive : {}) }}>
            Día activo
          </button>
          <button onClick={() => setView("semana")} style={{ ...styles.tab, ...(view === "semana" ? styles.tabActive : {}) }}>
            7 días
          </button>
          <button onClick={() => setView("examenes")} style={{ ...styles.tab, ...(view === "examenes" ? styles.tabActive : {}) }}>
            Top exámenes
          </button>
        </div>

        {view === "dia" && (
          <>
            <button onClick={() => setShowNew(true)} style={styles.addBtn}>+ Registrar paciente</button>
            {showNew && <NewRegistroForm onSave={addRegistro} onCancel={() => setShowNew(false)} />}

            <div style={styles.regList}>
              {registrosHoy.length === 0 ? (
                <div style={styles.empty}>Sin registros para esta fecha</div>
              ) : (
                registrosHoy.slice().reverse().map((r) => (
                  <div key={r.id} style={styles.regCard}>
                    <div style={styles.regTop}>
                      <div>
                        <div style={styles.regName}>{r.paciente || "Sin nombre"}</div>
                        <div style={styles.regMeta}>
                          {r.hora} · {r.previsional} · {(r.examenes || []).length} examen{(r.examenes || []).length !== 1 ? "es" : ""}
                        </div>
                      </div>
                      <div style={styles.regAmount}>{fmtCLP(r.monto || 0)}</div>
                    </div>
                    {(r.examenes || []).length > 0 && (
                      <div style={styles.regExams}>
                        {(r.examenes || []).map((e, idx) => (
                          <span key={idx} style={styles.examTag}>{e}</span>
                        ))}
                      </div>
                    )}
                    {confirmDeleteId === r.id ? (
                      <div style={styles.deleteConfirm}>
                        <button style={styles.confirmYes} onClick={() => deleteRegistro(r.id)}>Sí</button>
                        <button style={styles.confirmNo} onClick={() => setConfirmDeleteId(null)}>No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(r.id)} style={styles.regDelete} title="Eliminar">×</button>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {view === "semana" && (
          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>Últimos 7 días</div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={ultimos7} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--bdr)" />
                  <XAxis dataKey="label" tick={{ fill: 'var(--tx2)', fontSize: 10 }} axisLine={{ stroke: 'var(--bdr2)' }} />
                  <YAxis tick={{ fill: 'var(--tx2)', fontSize: 10 }} axisLine={{ stroke: 'var(--bdr2)' }} width={32} />
                  <Tooltip
                    contentStyle={{ background: 'var(--ibg)', border: '1px solid var(--bdr)', borderRadius: 8, color: 'var(--tx1)', fontSize: 13 }}
                  />
                  <Bar dataKey="pacientes" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={styles.weekSummary}>
              <div>Total semana: <strong style={{ color: "#38bdf8" }}>{ultimos7.reduce((s, d) => s + d.pacientes, 0)} pacientes</strong></div>
              <div>Ingresos: <strong style={{ color: "#34d399" }}>{fmtCLP(ultimos7.reduce((s, d) => s + d.ingresos, 0))}</strong></div>
              <div>Promedio diario: <strong style={{ color: "#a78bfa" }}>{(ultimos7.reduce((s, d) => s + d.pacientes, 0) / 7).toFixed(1)} pac</strong></div>
            </div>
          </div>
        )}

        {view === "examenes" && (
          <div style={styles.examCard}>
            <div style={styles.chartTitle}>Top exámenes (acumulado)</div>
            {topExamenes.length === 0 ? (
              <div style={styles.empty}>Sin datos aún</div>
            ) : (
              <div style={styles.examRanking}>
                {topExamenes.map((e, idx) => {
                  const max = topExamenes[0].count;
                  return (
                    <div key={e.name} style={styles.examRow}>
                      <span style={styles.examRank}>#{idx + 1}</span>
                      <div style={styles.examMain}>
                        <div style={styles.examName}>{e.name}</div>
                        <div style={styles.examBar}>
                          <div style={{ ...styles.examBarFill, width: `${(e.count / max) * 100}%` }} />
                        </div>
                      </div>
                      <span style={styles.examCount}>{e.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function NewRegistroForm({ onSave, onCancel }) {
  const [paciente, setPaciente] = useState("");
  const [previsional, setPrevisional] = useState("FONASA");
  const [examenes, setExamenes] = useState([]);
  const [monto, setMonto] = useState(0);

  const toggleExam = (e) => {
    setExamenes((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);
  };

  return (
    <div style={styles.newForm}>
      <div style={styles.newFormHeader}>
        <strong style={{ fontSize: 13, color: "var(--tx1)" }}>Nuevo registro</strong>
        <button onClick={onCancel} style={styles.closeBtn}>×</button>
      </div>
      <input type="text" placeholder="Nombre paciente (opcional)" value={paciente}
        onChange={(e) => setPaciente(e.target.value)} style={styles.input} />
      <div style={styles.previsionalRow}>
        {["FONASA", "ISAPRE", "Particular", "B2B"].map((p) => (
          <button key={p} onClick={() => setPrevisional(p)}
            style={{ ...styles.prevBtn, ...(previsional === p ? styles.prevBtnActive : {}) }}>
            {p}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--tx2)", marginTop: 4 }}>Exámenes (toca para seleccionar):</div>
      <div style={styles.examGrid}>
        {EXAM_CATALOG.map((e) => (
          <button key={e} onClick={() => toggleExam(e)}
            style={{ ...styles.examChip, ...(examenes.includes(e) ? styles.examChipActive : {}) }}>
            {e}
          </button>
        ))}
      </div>
      <div style={styles.inputRow}>
        <span style={{ color: "var(--tx2)", fontSize: 12 }}>$</span>
        <input type="number" placeholder="Monto" value={monto || ""}
          onChange={(e) => setMonto(Number(e.target.value) || 0)} style={{ ...styles.input, paddingLeft: 18 }} />
      </div>
      <button onClick={() => onSave({ paciente, previsional, examenes, monto })} style={styles.saveBtn}>
        Guardar registro
      </button>
    </div>
  );
}

function KPI({ label, value, color, big }) {
  return (
    <div style={{ ...styles.kpi, ...(big ? styles.kpiBig : {}) }}>
      <div style={styles.kpiLabel}>{label}</div>
      <div style={{ ...styles.kpiValue, color, ...(big ? { fontSize: 22 } : {}) }}>{value}</div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "linear-gradient(135deg, var(--bg) 0%, var(--bg2) 100%)", fontFamily: "'DM Sans', sans-serif", color: "var(--tx1)", position: "relative" },
  bg: { position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% -10%, var(--glow-c) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 },
  header: { position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "2rem 1rem 1.5rem" },
  badge: { display: "inline-block", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#38bdf8", background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)", borderRadius: 4, padding: "2px 8px", marginBottom: 8 },
  title: { fontSize: "1.9rem", fontWeight: 800, margin: 0, color: "var(--tx1)", letterSpacing: "-0.02em", lineHeight: 1.1 },
  subtitle: { fontSize: 13, color: "var(--tx2)", margin: "4px 0 1rem" },
  dateRow: { display: "flex", gap: 8, alignItems: "center", marginBottom: "1rem" },
  dateInput: { background: "var(--ibg)", border: "1px solid var(--bdr2)", borderRadius: 6, padding: "6px 10px", color: "var(--tx1)", fontSize: 13, outline: "none", fontFamily: "inherit", colorScheme: "dark" },
  todayBtn: { background: "rgba(56,189,248,0.15)", border: "1px solid #38bdf8", borderRadius: 6, padding: "6px 12px", fontSize: 11, color: "#38bdf8", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 },
  kpiGrid: { display: "flex", gap: 6, marginBottom: 6 },
  kpi: { flex: 1, background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10, padding: "0.65rem 0.7rem" },
  kpiBig: { padding: "0.85rem" },
  kpiLabel: { fontSize: 9, color: "var(--tx2)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 },
  kpiValue: { fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", lineHeight: 1 },
  alertList: { display: "flex", flexDirection: "column", gap: 6, marginTop: "0.85rem" },
  alert: { padding: "8px 12px", borderRadius: 8, border: "1px solid", fontSize: 12, fontWeight: 600 },
  main: { position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "0 1rem 3rem", display: "flex", flexDirection: "column", gap: "1rem" },
  tabs: { display: "flex", gap: 4, padding: 4, background: "var(--card)", borderRadius: 10, border: "1px solid var(--bdr)" },
  tab: { flex: 1, background: "transparent", border: "none", padding: "8px 12px", fontSize: 12, color: "var(--tx2)", cursor: "pointer", borderRadius: 6, fontWeight: 600, fontFamily: "inherit" },
  tabActive: { background: "rgba(56,189,248,0.15)", color: "#38bdf8" },
  addBtn: { background: "rgba(56,189,248,0.15)", border: "1px solid #38bdf8", borderRadius: 10, padding: "12px", fontSize: 13, color: "#38bdf8", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" },
  newForm: { background: "var(--card)", border: "1px solid #38bdf8", borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column", gap: 10 },
  newFormHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  closeBtn: { background: "none", border: "none", color: "var(--tx2)", fontSize: 22, cursor: "pointer", padding: 0, lineHeight: 1 },
  input: { background: "var(--ibg)", border: "1px solid var(--bdr2)", borderRadius: 6, padding: "8px 10px", color: "var(--tx1)", fontSize: 13, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  inputRow: { position: "relative", display: "flex", alignItems: "center" },
  previsionalRow: { display: "flex", gap: 4 },
  prevBtn: { flex: 1, background: "var(--ibg)", border: "1px solid var(--bdr2)", borderRadius: 6, padding: "6px 8px", fontSize: 11, color: "var(--tx2)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 },
  prevBtnActive: { background: "rgba(56,189,248,0.15)", borderColor: "#38bdf8", color: "#38bdf8" },
  examGrid: { display: "flex", flexWrap: "wrap", gap: 4 },
  examChip: { background: "var(--ibg)", border: "1px solid var(--bdr2)", borderRadius: 4, padding: "4px 8px", fontSize: 10, color: "var(--tx2)", cursor: "pointer", fontFamily: "inherit" },
  examChipActive: { background: "rgba(167,139,250,0.15)", borderColor: "#a78bfa", color: "#a78bfa", fontWeight: 600 },
  saveBtn: { background: "#38bdf8", border: "none", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", marginTop: 6 },
  regList: { display: "flex", flexDirection: "column", gap: 6 },
  regCard: { position: "relative", background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10, padding: "0.75rem 0.9rem" },
  regTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 },
  regName: { fontSize: 13, fontWeight: 700, color: "var(--tx1)" },
  regMeta: { fontSize: 11, color: "var(--tx2)", marginTop: 2 },
  regAmount: { fontSize: 14, fontWeight: 800, color: "#34d399", fontVariantNumeric: "tabular-nums" },
  regExams: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 },
  examTag: { fontSize: 9, color: "#a78bfa", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 3, padding: "1px 6px" },
  regDelete: { position: "absolute", top: 6, right: 8, background: "none", border: "none", color: "var(--tx3)", fontSize: 16, cursor: "pointer", padding: 0, lineHeight: 1 },
  deleteConfirm: { position: "absolute", top: 4, right: 6, display: "flex", gap: 4, alignItems: "center" },
  confirmYes: { background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.4)", borderRadius: 5, padding: "3px 8px", fontSize: 10, color: "#f87171", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 },
  confirmNo: { background: "transparent", border: "1px solid var(--bdr2)", borderRadius: 5, padding: "3px 8px", fontSize: 10, color: "var(--tx2)", cursor: "pointer", fontFamily: "inherit" },
  empty: { textAlign: "center", padding: "2rem", color: "var(--tx2)", fontSize: 12, background: "var(--card)", border: "1px dashed var(--bdr2)", borderRadius: 10 },
  chartCard: { background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 12, padding: "1rem" },
  chartTitle: { fontSize: 13, fontWeight: 700, color: "var(--tx1)", marginBottom: "0.75rem" },
  weekSummary: { display: "flex", flexDirection: "column", gap: 4, marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--bdr)", fontSize: 12, color: "var(--tx2)" },
  examCard: { background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 12, padding: "1rem" },
  examRanking: { display: "flex", flexDirection: "column", gap: 8 },
  examRow: { display: "flex", alignItems: "center", gap: 10 },
  examRank: { fontSize: 11, fontWeight: 800, color: "#fbbf24", minWidth: 22 },
  examMain: { flex: 1, minWidth: 0 },
  examName: { fontSize: 12, color: "var(--tx1)", marginBottom: 4 },
  examBar: { height: 4, background: "var(--bdr)", borderRadius: 2, overflow: "hidden" },
  examBarFill: { height: "100%", background: "linear-gradient(90deg, #38bdf8, #a78bfa)", borderRadius: 2, transition: "width 0.4s" },
  examCount: { fontSize: 13, fontWeight: 700, color: "#38bdf8", fontVariantNumeric: "tabular-nums" },
};
