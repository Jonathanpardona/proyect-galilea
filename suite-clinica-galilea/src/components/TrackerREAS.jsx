import { useState, useMemo, useEffect } from "react";

const STORAGE_KEY = "tracker_reas_v1";

const TIPOS = [
  { id: "infeccioso", label: "Residuos infecciosos", color: "#f87171", icon: "🦠" },
  { id: "cortopunzante", label: "Cortopunzantes", color: "#fbbf24", icon: "💉" },
  { id: "especiales", label: "Especiales otros", color: "#a78bfa", icon: "⚠️" },
];

const today = () => new Date().toISOString().slice(0, 10);
const fmtCLP = (n) => `$${Math.round(n).toLocaleString("es-CL")}`;

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

export default function TrackerREAS() {
  const [retiros, setRetiros] = useState(() => loadSaved().retiros ?? []);
  const [empresa, setEmpresa] = useState(() => loadSaved().empresa || "REAS Manejo Ltda.");
  const [rutEmpresa, setRutEmpresa] = useState(() => loadSaved().rutEmpresa || "");
  const [responsable, setResponsable] = useState(() => loadSaved().responsable || "");
  const [showNew, setShowNew] = useState(false);
  const [view, setView] = useState("bitacora");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ retiros, empresa, rutEmpresa, responsable })); } catch { /* noop */ }
  }, [retiros, empresa, rutEmpresa, responsable]);

  const addRetiro = (data) => {
    setRetiros((prev) => [...prev, { id: `r${Date.now()}`, ...data }]);
    setShowNew(false);
  };

  const deleteRetiro = (id) => {
    if (confirm("¿Eliminar este registro?")) setRetiros((prev) => prev.filter((r) => r.id !== id));
  };

  const sorted = useMemo(() => [...retiros].sort((a, b) => b.fecha.localeCompare(a.fecha)), [retiros]);

  const stats = useMemo(() => {
    const total = retiros.length;
    const kilosTotal = retiros.reduce((s, r) => s + (Number(r.kilos) || 0), 0);
    const costoTotal = retiros.reduce((s, r) => s + (Number(r.costo) || 0), 0);

    // Próximo retiro recomendado (cada 7-15 días)
    const last = sorted[0];
    let diasDesdeUltimo = null;
    let proximoRetiro = null;
    if (last) {
      const dias = Math.floor((new Date() - new Date(last.fecha)) / (1000 * 60 * 60 * 24));
      diasDesdeUltimo = dias;
      const proximo = new Date(last.fecha);
      proximo.setDate(proximo.getDate() + 14);
      proximoRetiro = proximo.toISOString().slice(0, 10);
    }

    return { total, kilosTotal, costoTotal, diasDesdeUltimo, proximoRetiro };
  }, [retiros, sorted]);

  const generarCertificado = (r) => {
    const text = `CERTIFICADO DE RETIRO REAS
DS N°6/2009 - Reglamento sobre Manejo de Residuos de Establecimientos de Atención de Salud

ESTABLECIMIENTO QUE GENERA: Sala de Toma de Muestras Galilea
DIRECCIÓN: Av. Padre Alberto Hurtado 0195, Los Ángeles
RESPONSABLE: ${responsable || "[Director Técnico]"}

EMPRESA AUTORIZADA DE RETIRO: ${empresa}
RUT: ${rutEmpresa || "[RUT empresa]"}

DETALLE DEL RETIRO:
Fecha: ${r.fecha}
Hora: ${r.hora || "—"}
Manifiesto N°: ${r.manifiesto || "—"}
Transportista: ${r.transportista || "—"}

RESIDUOS RETIRADOS:
${r.detalles.map((d) => {
  const tipo = TIPOS.find((t) => t.id === d.tipo);
  return `- ${tipo?.label || d.tipo}: ${d.kilos} kg`;
}).join("\n")}

TOTAL: ${r.kilos} kg
COSTO DEL SERVICIO: ${fmtCLP(r.costo || 0)}

OBSERVACIONES:
${r.notas || "Sin observaciones."}

Documento generado el ${today()}.

_______________________________
${responsable || "Responsable establecimiento"}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificado_REAS_${r.fecha}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.root}>
      <div style={styles.bg} />
      <header style={styles.header}>
        <div style={styles.badge}>REAS · DS N°6/2009</div>
        <h1 style={styles.title}>Tracker REAS</h1>
        <p style={styles.subtitle}>Bitácora de retiros y certificados sanitarios</p>

        <div style={styles.kpiGrid}>
          <KPI label="Total retiros" value={stats.total} color="#fbbf24" />
          <KPI label="Kg acumulados" value={`${stats.kilosTotal.toFixed(1)}`} color="#a78bfa" />
          <KPI label="Costo año" value={fmtCLP(stats.costoTotal)} color="#34d399" />
        </div>

        {stats.diasDesdeUltimo !== null && (
          <div style={{
            ...styles.alert,
            background: stats.diasDesdeUltimo > 14 ? "rgba(248,113,113,0.08)" : stats.diasDesdeUltimo > 10 ? "rgba(251,191,36,0.08)" : "rgba(52,211,153,0.08)",
            borderColor: stats.diasDesdeUltimo > 14 ? "#f8717140" : stats.diasDesdeUltimo > 10 ? "#fbbf2440" : "#34d39940",
            color: stats.diasDesdeUltimo > 14 ? "#f87171" : stats.diasDesdeUltimo > 10 ? "#fbbf24" : "#34d399",
          }}>
            {stats.diasDesdeUltimo > 14 ? "⚠ ATRASADO: " : stats.diasDesdeUltimo > 10 ? "⏰ Pronto: " : "✓ Al día: "}
            Hace {stats.diasDesdeUltimo} días del último retiro. Próximo sugerido: {stats.proximoRetiro}
          </div>
        )}
      </header>

      <main style={styles.main}>
        <div style={styles.tabs}>
          <button onClick={() => setView("bitacora")} style={{ ...styles.tab, ...(view === "bitacora" ? styles.tabActive : {}) }}>Bitácora</button>
          <button onClick={() => setView("config")} style={{ ...styles.tab, ...(view === "config" ? styles.tabActive : {}) }}>Configuración</button>
        </div>

        {view === "bitacora" && (
          <>
            <button onClick={() => setShowNew(true)} style={styles.addBtn}>+ Registrar retiro</button>
            {showNew && <NewRetiroForm onSave={addRetiro} onCancel={() => setShowNew(false)} />}

            <div style={styles.list}>
              {sorted.length === 0 ? (
                <div style={styles.empty}>Sin retiros registrados</div>
              ) : (
                sorted.map((r) => (
                  <div key={r.id} style={styles.card}>
                    <div style={styles.cardTop}>
                      <div>
                        <div style={styles.cardDate}>{r.fecha}</div>
                        <div style={styles.cardMeta}>Manifiesto: {r.manifiesto || "—"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={styles.cardKilos}>{r.kilos} kg</div>
                        <div style={styles.cardCost}>{fmtCLP(r.costo || 0)}</div>
                      </div>
                    </div>
                    <div style={styles.cardDetails}>
                      {r.detalles.map((d, idx) => {
                        const tipo = TIPOS.find((t) => t.id === d.tipo);
                        return (
                          <span key={idx} style={{
                            ...styles.detailTag,
                            color: tipo?.color, borderColor: `${tipo?.color}40`, background: `${tipo?.color}10`,
                          }}>
                            {tipo?.icon} {d.kilos}kg
                          </span>
                        );
                      })}
                    </div>
                    <div style={styles.cardActions}>
                      <button onClick={() => generarCertificado(r)} style={styles.certBtn}>📄 Certificado</button>
                      {confirmDeleteId === r.id ? (
                        <div style={styles.deleteConfirm}>
                          <span style={{ fontSize: 11, color: "#f87171" }}>¿Eliminar?</span>
                          <button style={styles.confirmYes} onClick={() => deleteRetiro(r.id)}>Sí</button>
                          <button style={styles.confirmNo} onClick={() => setConfirmDeleteId(null)}>No</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(r.id)} style={styles.deleteBtn}>🗑</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {view === "config" && (
          <div style={styles.configCard}>
            <Field label="Empresa autorizada" value={empresa} onChange={setEmpresa} />
            <Field label="RUT empresa" value={rutEmpresa} onChange={setRutEmpresa} />
            <Field label="Responsable establecimiento" value={responsable} onChange={setResponsable} />

            <div style={styles.tipCard}>
              <div style={styles.tipTitle}>💡 Cumplimiento REAS</div>
              <div style={styles.tipText}>
                Mantén los certificados <strong style={{ color: "#fbbf24" }}>mínimo 5 años</strong>.
                SEREMI puede solicitar en cualquier inspección los certificados desde la apertura.
                Recomendado: retiro cada 7-14 días según volumen.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function NewRetiroForm({ onSave, onCancel }) {
  const [fecha, setFecha] = useState(today());
  const [hora, setHora] = useState("");
  const [manifiesto, setManifiesto] = useState("");
  const [transportista, setTransportista] = useState("");
  const [detalles, setDetalles] = useState([{ tipo: "infeccioso", kilos: 0 }]);
  const [costo, setCosto] = useState(0);
  const [notas, setNotas] = useState("");

  const totalKilos = detalles.reduce((s, d) => s + (Number(d.kilos) || 0), 0);

  return (
    <div style={styles.newForm}>
      <div style={styles.newFormHeader}>
        <strong style={{ fontSize: 13, color: "#e8f4ff" }}>Nuevo retiro</strong>
        <button onClick={onCancel} style={styles.closeBtn}>×</button>
      </div>
      <div style={styles.fieldRow}>
        <Field label="Fecha" type="date" value={fecha} onChange={setFecha} />
        <Field label="Hora" type="time" value={hora} onChange={setHora} />
      </div>
      <div style={styles.fieldRow}>
        <Field label="N° manifiesto" value={manifiesto} onChange={setManifiesto} />
        <Field label="Transportista" value={transportista} onChange={setTransportista} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={styles.fieldLabel}>Residuos por tipo</label>
        {detalles.map((d, idx) => (
          <div key={idx} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <select value={d.tipo} onChange={(e) => {
              const newD = [...detalles]; newD[idx].tipo = e.target.value; setDetalles(newD);
            }} style={{ ...styles.fieldInput, flex: 1 }}>
              {TIPOS.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
            </select>
            <input type="number" step="0.1" placeholder="Kg" value={d.kilos || ""} onChange={(e) => {
              const newD = [...detalles]; newD[idx].kilos = Number(e.target.value) || 0; setDetalles(newD);
            }} style={{ ...styles.fieldInput, width: 80 }} />
            {detalles.length > 1 && (
              <button onClick={() => setDetalles(detalles.filter((_, i) => i !== idx))}
                style={styles.removeBtn}>×</button>
            )}
          </div>
        ))}
        <button onClick={() => setDetalles([...detalles, { tipo: "infeccioso", kilos: 0 }])}
          style={styles.addRowBtn}>+ Agregar tipo</button>
      </div>
      <Field label="Costo del servicio" type="number" value={costo} onChange={(v) => setCosto(Number(v) || 0)} />
      <Field label="Observaciones" value={notas} onChange={setNotas} />
      <div style={styles.totalRow}>Total: <strong style={{ color: "#fbbf24" }}>{totalKilos.toFixed(1)} kg</strong></div>
      <button onClick={() => onSave({ fecha, hora, manifiesto, transportista, detalles, kilos: totalKilos, costo, notas })} style={styles.saveBtn}>
        Guardar retiro
      </button>
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
function KPI({ label, value, color }) {
  return (
    <div style={styles.kpi}>
      <div style={styles.kpiLabel}>{label}</div>
      <div style={{ ...styles.kpiValue, color }}>{value}</div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#050f1e", fontFamily: "'DM Sans', sans-serif", color: "#cde4f5", position: "relative" },
  bg: { position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 20% 0%, #3a2a0a 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 },
  header: { position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "2rem 1rem 1.5rem" },
  badge: { display: "inline-block", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 4, padding: "2px 8px", marginBottom: 8 },
  title: { fontSize: "1.9rem", fontWeight: 800, margin: 0, color: "#e8f4ff", letterSpacing: "-0.02em", lineHeight: 1.1 },
  subtitle: { fontSize: 13, color: "#5a8aaa", margin: "4px 0 1.25rem" },
  kpiGrid: { display: "flex", gap: 6, marginBottom: "0.85rem" },
  kpi: { flex: 1, background: "rgba(10,25,48,0.6)", border: "1px solid #0e2a45", borderRadius: 10, padding: "0.7rem" },
  kpiLabel: { fontSize: 9, color: "#5a8aaa", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 },
  kpiValue: { fontSize: 16, fontWeight: 800, fontVariantNumeric: "tabular-nums" },
  alert: { padding: "8px 12px", borderRadius: 8, border: "1px solid", fontSize: 12, fontWeight: 600 },
  main: { position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "0 1rem 3rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  tabs: { display: "flex", gap: 4, padding: 4, background: "rgba(10,25,48,0.5)", borderRadius: 10, border: "1px solid #0e2a45" },
  tab: { flex: 1, background: "transparent", border: "none", padding: "8px 12px", fontSize: 12, color: "#5a8aaa", cursor: "pointer", borderRadius: 6, fontWeight: 600, fontFamily: "inherit" },
  tabActive: { background: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  addBtn: { background: "rgba(251,191,36,0.15)", border: "1px solid #fbbf24", borderRadius: 10, padding: "12px", fontSize: 13, color: "#fbbf24", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" },
  newForm: { background: "rgba(10,25,48,0.8)", border: "1px solid #fbbf24", borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column", gap: 10 },
  newFormHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  closeBtn: { background: "none", border: "none", color: "#5a8aaa", fontSize: 22, cursor: "pointer", padding: 0, lineHeight: 1 },
  fieldRow: { display: "flex", gap: 8 },
  field: { display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 },
  fieldLabel: { fontSize: 10, color: "#5a8aaa", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 },
  fieldInput: { background: "rgba(5,15,30,0.7)", border: "1px solid #1a3a5c", borderRadius: 6, padding: "8px 10px", color: "#cde4f5", fontSize: 13, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box", colorScheme: "dark" },
  removeBtn: { background: "transparent", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", borderRadius: 6, width: 30, height: 30, cursor: "pointer", fontFamily: "inherit" },
  addRowBtn: { background: "transparent", border: "1px dashed #1a3a5c", borderRadius: 6, padding: "6px 12px", fontSize: 11, color: "#5a8aaa", cursor: "pointer", fontFamily: "inherit" },
  totalRow: { textAlign: "right", fontSize: 13, color: "#cde4f5", paddingTop: 6, borderTop: "1px solid rgba(14,42,69,0.5)" },
  saveBtn: { background: "#fbbf24", border: "none", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#0a1929", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", marginTop: 6 },
  list: { display: "flex", flexDirection: "column", gap: 8 },
  empty: { textAlign: "center", padding: "2rem", color: "#5a8aaa", fontSize: 12, background: "rgba(10,25,48,0.3)", border: "1px dashed #1a3a5c", borderRadius: 10 },
  card: { background: "rgba(10,25,48,0.6)", border: "1px solid #0e2a45", borderRadius: 10, padding: "0.85rem 1rem" },
  cardTop: { display: "flex", justifyContent: "space-between", marginBottom: 8 },
  cardDate: { fontSize: 14, fontWeight: 800, color: "#e8f4ff" },
  cardMeta: { fontSize: 11, color: "#5a8aaa", marginTop: 2 },
  cardKilos: { fontSize: 15, fontWeight: 800, color: "#fbbf24" },
  cardCost: { fontSize: 11, color: "#34d399", marginTop: 2 },
  cardDetails: { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 },
  detailTag: { fontSize: 10, fontWeight: 600, padding: "3px 7px", borderRadius: 4, border: "1px solid" },
  cardActions: { display: "flex", gap: 6 },
  certBtn: { flex: 1, background: "transparent", border: "1px solid #38bdf8", borderRadius: 6, padding: "6px", fontSize: 11, color: "#38bdf8", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 },
  deleteBtn: { background: "transparent", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 6, padding: "6px 12px", fontSize: 11, color: "#f87171", cursor: "pointer", fontFamily: "inherit" },
  deleteConfirm: { display: "flex", gap: 4, alignItems: "center" },
  confirmYes: { background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.4)", borderRadius: 5, padding: "4px 10px", fontSize: 11, color: "#f87171", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 },
  confirmNo: { background: "transparent", border: "1px solid #1a3a5c", borderRadius: 5, padding: "4px 10px", fontSize: 11, color: "#7aaec8", cursor: "pointer", fontFamily: "inherit" },
  configCard: { background: "rgba(10,25,48,0.6)", border: "1px solid #0e2a45", borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column", gap: 10 },
  tipCard: { background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10, padding: "0.85rem", marginTop: 8 },
  tipTitle: { fontSize: 12, fontWeight: 700, color: "#38bdf8", marginBottom: 6 },
  tipText: { fontSize: 12, color: "#cde4f5", lineHeight: 1.6 },
};
