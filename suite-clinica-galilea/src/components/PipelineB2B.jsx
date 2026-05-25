import { useState, useMemo, useEffect } from "react";

const STORAGE_KEY = "pipeline_b2b_v1";

const STAGES = [
  { id: "prospecto", name: "Prospecto", color: "#5a8aaa", icon: "👁️", prob: 10 },
  { id: "contactado", name: "Contactado", color: "#38bdf8", icon: "📞", prob: 25 },
  { id: "reunion", name: "Reunión", color: "#a78bfa", icon: "🤝", prob: 50 },
  { id: "propuesta", name: "Propuesta", color: "#fbbf24", icon: "📄", prob: 70 },
  { id: "negociacion", name: "Negociación", color: "#fb923c", icon: "💬", prob: 85 },
  { id: "ganado", name: "Ganado", color: "#34d399", icon: "✓", prob: 100 },
  { id: "perdido", name: "Perdido", color: "#f87171", icon: "✗", prob: 0 },
];

const PACKAGES = {
  basico: { name: "Básico", price: 35000, exams: "Hemograma + Glicemia + Orina + Audiometría básica" },
  preocupacional: { name: "Pre-ocupacional", price: 55000, exams: "Básico + Audiometría + Radiografía tórax + ECG" },
  altura: { name: "Trabajo en altura", price: 85000, exams: "Pre-ocupacional + Espirometría + Glicemia post + Psicosensotécnico" },
  altura_geo: { name: "Altura geográfica", price: 95000, exams: "Altura + Hemoglobina + Oximetría + Evaluación cardiovascular" },
  manipulador: { name: "Manipulador alimentos", price: 28000, exams: "Coprológico + Parasitológico + Cultivo faríngeo" },
};

const SAMPLE_PROSPECTS = [
  { id: "p1", company: "Forestal del Sur Ltda.", contact: "Juan Pérez", role: "Prevencionista", phone: "+56 9 8765 4321", email: "jperez@forestaldelsur.cl", stage: "prospecto", employees: 35, ecosystem: "CMPC", package: "altura", notes: "Subcontratista CMPC zona Mulchén. 35 trabajadores con renovación anual de exámenes." },
  { id: "p2", company: "Transportes Bío-Bío SpA", contact: "María González", role: "RRHH", phone: "+56 9 7654 3210", email: "mgonzalez@tbb.cl", stage: "contactado", employees: 22, ecosystem: "Arauco", package: "preocupacional", notes: "Empresa de transporte forestal. Renovaciones cada 2 años." },
];

const fmtCLP = (n) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${Math.round(n).toLocaleString("es-CL")}`;
};
const fmtFull = (n) => `$${Math.round(n).toLocaleString("es-CL")}`;

export default function PipelineB2B() {
  const [prospects, setProspects] = useState(SAMPLE_PROSPECTS);
  const [editingId, setEditingId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState("activos");
  const [view, setView] = useState("kanban");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.prospects) setProspects(p.prospects);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ prospects })); } catch {}
  }, [prospects, loaded]);

  const updateProspect = (id, field, val) => {
    setProspects((prev) => prev.map((p) => p.id === id ? { ...p, [field]: val } : p));
  };

  const deleteProspect = (id) => {
    if (confirm("¿Eliminar este prospecto?")) {
      setProspects((prev) => prev.filter((p) => p.id !== id));
      setEditingId(null);
    }
  };

  const addProspect = (data) => {
    const newP = {
      id: `p${Date.now()}`,
      stage: "prospecto",
      employees: 10,
      ecosystem: "CMPC",
      package: "preocupacional",
      ...data,
    };
    setProspects((prev) => [...prev, newP]);
    setShowNew(false);
  };

  const filtered = useMemo(() => {
    if (filter === "ganados") return prospects.filter((p) => p.stage === "ganado");
    if (filter === "perdidos") return prospects.filter((p) => p.stage === "perdido");
    if (filter === "activos") return prospects.filter((p) => !["ganado", "perdido"].includes(p.stage));
    return prospects;
  }, [prospects, filter]);

  const getValue = (p) => (PACKAGES[p.package]?.price || 0) * (p.employees || 0);
  const getWeighted = (p) => {
    const stage = STAGES.find((s) => s.id === p.stage);
    return getValue(p) * ((stage?.prob || 0) / 100);
  };

  const stats = useMemo(() => {
    const activos = prospects.filter((p) => !["ganado", "perdido"].includes(p.stage));
    const ganados = prospects.filter((p) => p.stage === "ganado");

    const pipelineValue = activos.reduce((s, p) => s + getValue(p), 0);
    const weightedValue = activos.reduce((s, p) => s + getWeighted(p), 0);
    const closedValue = ganados.reduce((s, p) => s + getValue(p), 0);
    const totalEmployees = activos.reduce((s, p) => s + (p.employees || 0), 0);

    const conversionRate = prospects.length > 0
      ? (ganados.length / (ganados.length + prospects.filter((p) => p.stage === "perdido").length)) * 100
      : 0;

    return { pipelineValue, weightedValue, closedValue, totalEmployees, conversionRate, totalActivos: activos.length };
  }, [prospects]);

  const byStage = useMemo(() => {
    return STAGES.map((stage) => ({
      ...stage,
      prospects: filtered.filter((p) => p.stage === stage.id),
      value: filtered.filter((p) => p.stage === stage.id).reduce((s, p) => s + getValue(p), 0),
    }));
  }, [filtered]);

  return (
    <div style={styles.root}>
      <div style={styles.bg} />

      <header style={styles.header}>
        <div style={styles.badge}>Pipeline B2B · Medicina Ocupacional</div>
        <h1 style={styles.title}>Forestal & Subcontratistas</h1>
        <p style={styles.subtitle}>CMPC · Arauco · transporte forestal · construcción</p>

        <div style={styles.kpiGrid}>
          <KPI label="Pipeline activo" value={fmtCLP(stats.pipelineValue)} color="#a78bfa" big />
          <KPI label="Ponderado" value={fmtCLP(stats.weightedValue)} color="#38bdf8" big />
        </div>
        <div style={styles.kpiGrid}>
          <KPI label="Cerrado" value={fmtCLP(stats.closedValue)} color="#34d399" />
          <KPI label="Trabajadores" value={stats.totalEmployees.toLocaleString("es-CL")} color="#fbbf24" />
          <KPI label="Conversión" value={`${stats.conversionRate.toFixed(0)}%`} color="#10b981" />
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.actionRow}>
          <button onClick={() => setShowNew(true)} style={styles.addBtn}>+ Nuevo prospecto</button>
          <div style={styles.viewToggle}>
            <button onClick={() => setView("kanban")}
              style={{ ...styles.viewBtn, ...(view === "kanban" ? styles.viewBtnActive : {}) }}>Kanban</button>
            <button onClick={() => setView("lista")}
              style={{ ...styles.viewBtn, ...(view === "lista" ? styles.viewBtnActive : {}) }}>Lista</button>
          </div>
        </div>

        <div style={styles.filterRow}>
          {["activos", "ganados", "perdidos", "todos"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ ...styles.filterChip, ...(filter === f ? styles.filterChipActive : {}) }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {showNew && <NewProspectForm onSave={addProspect} onCancel={() => setShowNew(false)} />}

        {view === "kanban" ? (
          <div style={styles.kanban}>
            {byStage.filter((s) => filter === "todos" || (filter === "activos" && !["ganado", "perdido"].includes(s.id)) || (filter === "ganados" && s.id === "ganado") || (filter === "perdidos" && s.id === "perdido")).map((stage) => (
              <div key={stage.id} style={styles.stageCol}>
                <div style={{ ...styles.stageHeader, borderTop: `2px solid ${stage.color}` }}>
                  <div style={styles.stageHeaderTop}>
                    <span style={styles.stageIcon}>{stage.icon}</span>
                    <span style={{ ...styles.stageName, color: stage.color }}>{stage.name}</span>
                    <span style={styles.stageCount}>{stage.prospects.length}</span>
                  </div>
                  {stage.value > 0 && <div style={styles.stageValue}>{fmtCLP(stage.value)}</div>}
                </div>
                <div style={styles.stageList}>
                  {stage.prospects.map((p) => (
                    <ProspectCard key={p.id} prospect={p}
                      onClick={() => setEditingId(p.id)}
                      value={getValue(p)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.listView}>
            {filtered.map((p) => {
              const stage = STAGES.find((s) => s.id === p.stage);
              return (
                <div key={p.id} style={styles.listRow} onClick={() => setEditingId(p.id)}>
                  <div style={{ ...styles.listStage, background: `${stage.color}20`, color: stage.color }}>
                    {stage.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.listCompany}>{p.company}</div>
                    <div style={styles.listMeta}>
                      {p.employees} trabajadores · {PACKAGES[p.package]?.name}
                    </div>
                  </div>
                  <div style={styles.listValue}>{fmtCLP(getValue(p))}</div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={styles.empty}>Sin prospectos en este filtro</div>
            )}
          </div>
        )}

        {editingId && (
          <ProspectModal
            prospect={prospects.find((p) => p.id === editingId)}
            onUpdate={(field, val) => updateProspect(editingId, field, val)}
            onDelete={() => deleteProspect(editingId)}
            onClose={() => setEditingId(null)}
          />
        )}

        <div style={styles.tipCard}>
          <div style={styles.tipTitle}>💡 Ticket promedio B2B vs FONASA</div>
          <div style={styles.tipText}>
            Un paquete pre-ocupacional de $55.000 × 20 trabajadores = <strong style={{ color: "#34d399" }}>$1.100.000</strong> en
            una sola visita. Eso equivale a ~115 pacientes FONASA. Por eso este canal es estratégico.
          </div>
        </div>
      </main>
    </div>
  );
}

function ProspectCard({ prospect, onClick, value }) {
  const pkg = PACKAGES[prospect.package];
  return (
    <button style={styles.card} onClick={onClick}>
      <div style={styles.cardCompany}>{prospect.company}</div>
      <div style={styles.cardContact}>{prospect.contact}</div>
      <div style={styles.cardFooter}>
        <span style={{ fontSize: 10, color: "#5a8aaa" }}>{prospect.employees} trab.</span>
        <span style={{ fontSize: 12, color: "#34d399", fontWeight: 700 }}>{fmtCLP(value)}</span>
      </div>
      {prospect.ecosystem && (
        <div style={{
          ...styles.ecosystemTag,
          color: prospect.ecosystem === "CMPC" ? "#38bdf8" : "#fbbf24",
          borderColor: (prospect.ecosystem === "CMPC" ? "#38bdf8" : "#fbbf24") + "40",
        }}>{prospect.ecosystem}</div>
      )}
    </button>
  );
}

function ProspectModal({ prospect, onUpdate, onDelete, onClose }) {
  if (!prospect) return null;
  return (
    <div style={styles.modalBg} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Editar prospecto</h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div style={styles.modalBody}>
          <Field label="Empresa" value={prospect.company} onChange={(v) => onUpdate("company", v)} />
          <div style={styles.fieldRow}>
            <Field label="Contacto" value={prospect.contact} onChange={(v) => onUpdate("contact", v)} />
            <Field label="Cargo" value={prospect.role} onChange={(v) => onUpdate("role", v)} />
          </div>
          <div style={styles.fieldRow}>
            <Field label="Teléfono" value={prospect.phone} onChange={(v) => onUpdate("phone", v)} />
            <Field label="Email" value={prospect.email} onChange={(v) => onUpdate("email", v)} />
          </div>
          <div style={styles.fieldRow}>
            <Field label="N° trabajadores" value={prospect.employees} type="number" onChange={(v) => onUpdate("employees", Number(v) || 0)} />
            <Select label="Ecosistema" value={prospect.ecosystem} onChange={(v) => onUpdate("ecosystem", v)}
              options={[{ v: "CMPC", l: "CMPC" }, { v: "Arauco", l: "Arauco" }, { v: "Otro", l: "Otro" }]} />
          </div>
          <Select label="Paquete" value={prospect.package} onChange={(v) => onUpdate("package", v)}
            options={Object.entries(PACKAGES).map(([k, v]) => ({ v: k, l: `${v.name} · ${fmtCLP(v.price)}/trab.` }))} />
          <div style={styles.packageInfo}>{PACKAGES[prospect.package]?.exams}</div>
          <Select label="Etapa" value={prospect.stage} onChange={(v) => onUpdate("stage", v)}
            options={STAGES.map((s) => ({ v: s.id, l: `${s.icon} ${s.name} (${s.prob}%)` }))} />
          <TextArea label="Notas" value={prospect.notes || ""} onChange={(v) => onUpdate("notes", v)} />

          <div style={styles.valueBox}>
            <div style={styles.valueLabel}>Valor proyectado</div>
            <div style={styles.valueAmount}>
              {fmtFull((PACKAGES[prospect.package]?.price || 0) * (prospect.employees || 0))}
            </div>
            <div style={styles.valueDetail}>
              {prospect.employees} × {fmtCLP(PACKAGES[prospect.package]?.price || 0)}
            </div>
          </div>

          <button style={styles.deleteBtn} onClick={onDelete}>🗑 Eliminar prospecto</button>
        </div>
      </div>
    </div>
  );
}

function NewProspectForm({ onSave, onCancel }) {
  const [data, setData] = useState({
    company: "", contact: "", role: "", phone: "", email: "",
    employees: 10, ecosystem: "CMPC", package: "preocupacional", notes: "",
  });
  return (
    <div style={styles.newForm}>
      <div style={styles.newFormHeader}>
        <strong style={{ fontSize: 13 }}>Nuevo prospecto</strong>
        <button style={styles.closeBtn} onClick={onCancel}>×</button>
      </div>
      <Field label="Empresa *" value={data.company} onChange={(v) => setData({ ...data, company: v })} />
      <Field label="Contacto" value={data.contact} onChange={(v) => setData({ ...data, contact: v })} />
      <div style={styles.fieldRow}>
        <Field label="N° trabajadores" type="number" value={data.employees} onChange={(v) => setData({ ...data, employees: Number(v) || 0 })} />
        <Select label="Ecosistema" value={data.ecosystem} onChange={(v) => setData({ ...data, ecosystem: v })}
          options={[{ v: "CMPC", l: "CMPC" }, { v: "Arauco", l: "Arauco" }, { v: "Otro", l: "Otro" }]} />
      </div>
      <button style={styles.saveBtn}
        onClick={() => { if (data.company.trim()) onSave(data); }}>Crear</button>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={styles.fieldInput} />
    </div>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.fieldInput}>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}
function TextArea({ label, value, onChange }) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)}
        style={{ ...styles.fieldInput, minHeight: 60, resize: "vertical" }} />
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
  root: { minHeight: "100vh", background: "#050f1e", fontFamily: "'DM Sans', sans-serif", color: "#cde4f5", position: "relative" },
  bg: { position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 20% 0%, #2a1a4a 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, #0a3a2a 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 },
  header: { position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "2rem 1rem 1.5rem" },
  badge: { display: "inline-block", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a78bfa", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 4, padding: "2px 8px", marginBottom: 8 },
  title: { fontSize: "1.9rem", fontWeight: 800, margin: 0, color: "#e8f4ff", letterSpacing: "-0.02em", lineHeight: 1.1 },
  subtitle: { fontSize: 13, color: "#5a8aaa", margin: "4px 0 1.25rem" },
  kpiGrid: { display: "flex", gap: 6, marginBottom: 6 },
  kpi: { flex: 1, background: "rgba(10,25,48,0.6)", border: "1px solid #0e2a45", borderRadius: 10, padding: "0.65rem 0.7rem" },
  kpiBig: { padding: "0.85rem" },
  kpiLabel: { fontSize: 9, color: "#5a8aaa", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 },
  kpiValue: { fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", lineHeight: 1 },
  main: { position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "0 1rem 3rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  actionRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 },
  addBtn: { background: "rgba(167,139,250,0.15)", border: "1px solid #a78bfa", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#a78bfa", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" },
  viewToggle: { display: "flex", background: "rgba(10,25,48,0.5)", border: "1px solid #0e2a45", borderRadius: 8, padding: 3 },
  viewBtn: { background: "transparent", border: "none", padding: "5px 10px", fontSize: 11, color: "#5a8aaa", cursor: "pointer", borderRadius: 5, fontFamily: "inherit" },
  viewBtnActive: { background: "rgba(56,189,248,0.15)", color: "#38bdf8" },
  filterRow: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 },
  filterChip: { background: "rgba(10,25,48,0.5)", border: "1px solid #1a3a5c", borderRadius: 20, padding: "5px 12px", fontSize: 11, color: "#7aaec8", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit" },
  filterChipActive: { background: "rgba(167,139,250,0.15)", borderColor: "#a78bfa", color: "#a78bfa" },
  kanban: { display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch" },
  stageCol: { minWidth: 200, maxWidth: 220, flexShrink: 0, background: "rgba(10,25,48,0.4)", borderRadius: 10, padding: 10 },
  stageHeader: { paddingTop: 8, paddingBottom: 10, marginBottom: 8, borderBottom: "1px solid rgba(14,42,69,0.5)" },
  stageHeaderTop: { display: "flex", alignItems: "center", gap: 6 },
  stageIcon: { fontSize: 14 },
  stageName: { fontSize: 12, fontWeight: 700, flex: 1 },
  stageCount: { fontSize: 11, color: "#5a8aaa", background: "rgba(5,15,30,0.5)", borderRadius: 10, padding: "1px 7px", fontWeight: 700 },
  stageValue: { fontSize: 10, color: "#7aaec8", marginTop: 4, fontVariantNumeric: "tabular-nums" },
  stageList: { display: "flex", flexDirection: "column", gap: 6 },
  card: { background: "rgba(5,15,30,0.7)", border: "1px solid #0e2a45", borderRadius: 8, padding: "0.7rem", cursor: "pointer", textAlign: "left", color: "inherit", fontFamily: "inherit", position: "relative" },
  cardCompany: { fontSize: 12, fontWeight: 700, color: "#e8f4ff", marginBottom: 2 },
  cardContact: { fontSize: 10, color: "#7aaec8", marginBottom: 6 },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  ecosystemTag: { position: "absolute", top: 6, right: 6, fontSize: 8, fontWeight: 700, padding: "1px 4px", border: "1px solid", borderRadius: 3 },
  listView: { display: "flex", flexDirection: "column", gap: 6 },
  listRow: { display: "flex", alignItems: "center", gap: 10, padding: "0.75rem 0.9rem", background: "rgba(10,25,48,0.6)", border: "1px solid #0e2a45", borderRadius: 10, cursor: "pointer" },
  listStage: { width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
  listCompany: { fontSize: 13, fontWeight: 700, color: "#e8f4ff" },
  listMeta: { fontSize: 11, color: "#5a8aaa", marginTop: 2 },
  listValue: { fontSize: 13, fontWeight: 800, color: "#34d399", fontVariantNumeric: "tabular-nums", flexShrink: 0 },
  empty: { textAlign: "center", padding: "2rem", color: "#5a8aaa", fontSize: 12 },
  modalBg: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200, padding: 0 },
  modal: { background: "#0a1929", border: "1px solid #1a3a5c", borderRadius: "14px 14px 0 0", width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid #0e2a45", position: "sticky", top: 0, background: "#0a1929", zIndex: 1 },
  modalTitle: { fontSize: 15, fontWeight: 700, color: "#e8f4ff", margin: 0 },
  closeBtn: { background: "none", border: "none", color: "#5a8aaa", fontSize: 24, cursor: "pointer", padding: 0, lineHeight: 1, width: 28, height: 28 },
  modalBody: { padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  field: { display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 },
  fieldRow: { display: "flex", gap: 8 },
  fieldLabel: { fontSize: 10, color: "#5a8aaa", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 },
  fieldInput: { background: "rgba(5,15,30,0.7)", border: "1px solid #1a3a5c", borderRadius: 6, padding: "8px 10px", color: "#cde4f5", fontSize: 13, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  packageInfo: { fontSize: 11, color: "#7aaec8", padding: "6px 10px", background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 6, lineHeight: 1.5 },
  valueBox: { background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 8, padding: "0.85rem", textAlign: "center" },
  valueLabel: { fontSize: 10, color: "#5a8aaa", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 },
  valueAmount: { fontSize: 22, fontWeight: 900, color: "#34d399", fontVariantNumeric: "tabular-nums" },
  valueDetail: { fontSize: 11, color: "#7aaec8", marginTop: 2 },
  deleteBtn: { background: "transparent", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#f87171", cursor: "pointer", fontFamily: "inherit" },
  newForm: { background: "rgba(10,25,48,0.8)", border: "1px solid #a78bfa", borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column", gap: 8 },
  newFormHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  saveBtn: { background: "#a78bfa", border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 12, color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" },
  tipCard: { background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 10, padding: "0.85rem" },
  tipTitle: { fontSize: 12, fontWeight: 700, color: "#34d399", marginBottom: 6 },
  tipText: { fontSize: 12, color: "#cde4f5", lineHeight: 1.6 },
};
