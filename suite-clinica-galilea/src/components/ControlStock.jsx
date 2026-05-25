import { useState, useMemo, useEffect } from "react";

const STORAGE_KEY = "control_stock_v1";

const CATEGORIES = {
  toma: { name: "Toma de muestras", color: "#ef4444", icon: "🩸" },
  bioseg: { name: "Bioseguridad/EPP", color: "#34d399", icon: "🛡️" },
  reas: { name: "REAS", color: "#fbbf24", icon: "♻️" },
  oficina: { name: "Oficina/admin", color: "#38bdf8", icon: "📋" },
  limpieza: { name: "Limpieza", color: "#a78bfa", icon: "🧼" },
};

const DEFAULT_ITEMS = [
  { id: "i1", nombre: "Tubos tapa lila (EDTA)", categoria: "toma", unidad: "unid", stockActual: 200, stockMinimo: 100, consumoMensual: 600, precioUnit: 85, proveedor: "Lab Suministros SpA", leadTime: 7 },
  { id: "i2", nombre: "Tubos tapa amarilla (gel)", categoria: "toma", unidad: "unid", stockActual: 180, stockMinimo: 100, consumoMensual: 500, precioUnit: 95, proveedor: "Lab Suministros SpA", leadTime: 7 },
  { id: "i3", nombre: "Tubos tapa gris (fluoruro)", categoria: "toma", unidad: "unid", stockActual: 50, stockMinimo: 60, consumoMensual: 200, precioUnit: 90, proveedor: "Lab Suministros SpA", leadTime: 7 },
  { id: "i4", nombre: "Agujas vacutainer 21G", categoria: "toma", unidad: "unid", stockActual: 300, stockMinimo: 200, consumoMensual: 700, precioUnit: 110, proveedor: "Lab Suministros SpA", leadTime: 7 },
  { id: "i5", nombre: "Mariposas 23G pediátricas", categoria: "toma", unidad: "unid", stockActual: 40, stockMinimo: 30, consumoMensual: 80, precioUnit: 380, proveedor: "Lab Suministros SpA", leadTime: 7 },
  { id: "i6", nombre: "Algodón", categoria: "toma", unidad: "kg", stockActual: 2, stockMinimo: 1, consumoMensual: 3, precioUnit: 3500, proveedor: "Insumos Sur", leadTime: 5 },
  { id: "i7", nombre: "Alcohol 70%", categoria: "limpieza", unidad: "litro", stockActual: 4, stockMinimo: 3, consumoMensual: 8, precioUnit: 3200, proveedor: "Insumos Sur", leadTime: 5 },
  { id: "i8", nombre: "Guantes nitrilo M", categoria: "bioseg", unidad: "caja 100", stockActual: 8, stockMinimo: 6, consumoMensual: 15, precioUnit: 8500, proveedor: "Insumos Sur", leadTime: 5 },
  { id: "i9", nombre: "Mascarillas quirúrgicas", categoria: "bioseg", unidad: "caja 50", stockActual: 6, stockMinimo: 4, consumoMensual: 10, precioUnit: 4200, proveedor: "Insumos Sur", leadTime: 5 },
  { id: "i10", nombre: "Bolsas REAS amarillas", categoria: "reas", unidad: "unid", stockActual: 25, stockMinimo: 20, consumoMensual: 40, precioUnit: 450, proveedor: "REAS Manejo Ltda", leadTime: 10 },
  { id: "i11", nombre: "Contenedor cortopunzantes 5L", categoria: "reas", unidad: "unid", stockActual: 4, stockMinimo: 3, consumoMensual: 6, precioUnit: 4800, proveedor: "REAS Manejo Ltda", leadTime: 10 },
  { id: "i12", nombre: "Frascos orina estériles", categoria: "toma", unidad: "unid", stockActual: 80, stockMinimo: 50, consumoMensual: 150, precioUnit: 220, proveedor: "Lab Suministros SpA", leadTime: 7 },
  { id: "i13", nombre: "Etiquetas adhesivas", categoria: "oficina", unidad: "rollo", stockActual: 3, stockMinimo: 2, consumoMensual: 4, precioUnit: 6500, proveedor: "Distribuidora Office", leadTime: 3 },
  { id: "i14", nombre: "Hipoclorito 5%", categoria: "limpieza", unidad: "litro", stockActual: 3, stockMinimo: 2, consumoMensual: 5, precioUnit: 2800, proveedor: "Insumos Sur", leadTime: 5 },
];

const fmtCLP = (n) => `$${Math.round(n).toLocaleString("es-CL")}`;

export default function ControlStock() {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [editingId, setEditingId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [filtro, setFiltro] = useState("todos");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.items) setItems(p.items);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ items })); } catch {}
  }, [items, loaded]);

  const updateItem = (id, field, val) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: val } : i));
  };

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setEditingId(null);
  };

  const addItem = (data) => {
    setItems((prev) => [...prev, { id: `i${Date.now()}`, ...data }]);
    setShowNew(false);
  };

  const getStatus = (it) => {
    const ratio = it.stockActual / it.stockMinimo;
    const diasCobertura = it.consumoMensual > 0 ? (it.stockActual / it.consumoMensual) * 30 : 999;
    if (ratio < 0.5 || diasCobertura < it.leadTime) return "critico";
    if (ratio < 1) return "bajo";
    if (ratio < 1.5) return "atento";
    return "ok";
  };

  const filtered = useMemo(() => {
    if (filtro === "criticos") return items.filter((i) => getStatus(i) === "critico");
    if (filtro === "reposicion") return items.filter((i) => ["critico", "bajo"].includes(getStatus(i)));
    return items;
  }, [items, filtro]);

  const stats = useMemo(() => {
    const valorTotal = items.reduce((s, i) => s + (i.stockActual * i.precioUnit), 0);
    const criticos = items.filter((i) => getStatus(i) === "critico").length;
    const reposicion = items.filter((i) => ["critico", "bajo"].includes(getStatus(i))).length;
    const consumoMensual = items.reduce((s, i) => s + (i.consumoMensual * i.precioUnit), 0);
    return { valorTotal, criticos, reposicion, consumoMensual };
  }, [items]);

  // Generar orden de compra
  const ordenCompra = useMemo(() => {
    const porProveedor = {};
    items.filter((i) => ["critico", "bajo"].includes(getStatus(i))).forEach((i) => {
      const cantidad = Math.max((i.consumoMensual * 1.5) - i.stockActual, i.stockMinimo);
      const subtotal = cantidad * i.precioUnit;
      if (!porProveedor[i.proveedor]) porProveedor[i.proveedor] = { items: [], total: 0 };
      porProveedor[i.proveedor].items.push({ ...i, cantidad, subtotal });
      porProveedor[i.proveedor].total += subtotal;
    });
    return porProveedor;
  }, [items]);

  return (
    <div style={styles.root}>
      <div style={styles.bg} />
      <header style={styles.header}>
        <div style={styles.badge}>Inventario · Insumos</div>
        <h1 style={styles.title}>Control de Stock</h1>
        <p style={styles.subtitle}>Alertas automáticas de reposición</p>

        <div style={styles.kpiGrid}>
          <KPI label="Valor stock" value={fmtCLP(stats.valorTotal)} color="#34d399" big />
          <KPI label="Críticos" value={stats.criticos} color="#f87171" big />
        </div>
        <div style={styles.kpiGrid}>
          <KPI label="Por reponer" value={stats.reposicion} color="#fbbf24" />
          <KPI label="Consumo/mes" value={fmtCLP(stats.consumoMensual)} color="#38bdf8" />
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.filterRow}>
          {[{ k: "todos", l: "Todos" }, { k: "reposicion", l: "Por reponer" }, { k: "criticos", l: "Críticos" }].map((f) => (
            <button key={f.k} onClick={() => setFiltro(f.k)}
              style={{ ...styles.filterChip, ...(filtro === f.k ? styles.filterChipActive : {}) }}>
              {f.l}
            </button>
          ))}
          <button onClick={() => setShowNew(true)} style={styles.addBtn}>+ Insumo</button>
        </div>

        {showNew && <NewItemForm onSave={addItem} onCancel={() => setShowNew(false)} />}

        {Object.keys(ordenCompra).length > 0 && filtro !== "todos" && (
          <div style={styles.ocCard}>
            <div style={styles.ocTitle}>📋 Orden sugerida por proveedor</div>
            {Object.entries(ordenCompra).map(([prov, data]) => (
              <div key={prov} style={styles.ocProv}>
                <div style={styles.ocProvHeader}>
                  <strong style={{ color: "#fbbf24" }}>{prov}</strong>
                  <span style={{ color: "#34d399", fontWeight: 700 }}>{fmtCLP(data.total)}</span>
                </div>
                {data.items.map((i) => (
                  <div key={i.id} style={styles.ocItem}>
                    <span>{i.nombre}</span>
                    <span>{Math.ceil(i.cantidad)} {i.unidad}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div style={styles.itemList}>
          {filtered.map((it) => {
            const status = getStatus(it);
            const cat = CATEGORIES[it.categoria];
            const dias = it.consumoMensual > 0 ? (it.stockActual / it.consumoMensual) * 30 : 999;
            const colors = { critico: "#f87171", bajo: "#fbbf24", atento: "#38bdf8", ok: "#34d399" };
            const labels = { critico: "CRÍTICO", bajo: "BAJO", atento: "ATENTO", ok: "OK" };
            return (
              <div key={it.id} style={styles.itemCard} onClick={() => setEditingId(it.id)}>
                <div style={styles.itemTop}>
                  <span style={{ fontSize: 22 }}>{cat?.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.itemName}>{it.nombre}</div>
                    <div style={styles.itemMeta}>{it.stockActual} {it.unidad} · Mín {it.stockMinimo} · ~{Math.round(dias)}d cobertura</div>
                  </div>
                  <div style={{ ...styles.statusTag, background: `${colors[status]}20`, color: colors[status], borderColor: `${colors[status]}40` }}>
                    {labels[status]}
                  </div>
                </div>
                <div style={styles.stockBar}>
                  <div style={{
                    ...styles.stockBarFill,
                    width: `${Math.min((it.stockActual / (it.stockMinimo * 2)) * 100, 100)}%`,
                    background: colors[status],
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {editingId && <ItemModal item={items.find((i) => i.id === editingId)}
          onUpdate={(field, val) => updateItem(editingId, field, val)}
          onDelete={() => deleteItem(editingId)}
          onClose={() => setEditingId(null)} />}
      </main>
    </div>
  );
}

function ItemModal({ item, onUpdate, onDelete, onClose }) {
  const [confirming, setConfirming] = useState(false);
  if (!item) return null;
  return (
    <div style={styles.modalBg} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Editar insumo</h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div style={styles.modalBody}>
          <Field label="Nombre" value={item.nombre} onChange={(v) => onUpdate("nombre", v)} />
          <Select label="Categoría" value={item.categoria} onChange={(v) => onUpdate("categoria", v)}
            options={Object.entries(CATEGORIES).map(([k, v]) => ({ v: k, l: `${v.icon} ${v.name}` }))} />
          <div style={styles.fieldRow}>
            <Field label="Stock actual" type="number" value={item.stockActual} onChange={(v) => onUpdate("stockActual", Number(v) || 0)} />
            <Field label="Stock mínimo" type="number" value={item.stockMinimo} onChange={(v) => onUpdate("stockMinimo", Number(v) || 0)} />
          </div>
          <div style={styles.fieldRow}>
            <Field label="Unidad" value={item.unidad} onChange={(v) => onUpdate("unidad", v)} />
            <Field label="Consumo/mes" type="number" value={item.consumoMensual} onChange={(v) => onUpdate("consumoMensual", Number(v) || 0)} />
          </div>
          <div style={styles.fieldRow}>
            <Field label="Precio unit." type="number" value={item.precioUnit} onChange={(v) => onUpdate("precioUnit", Number(v) || 0)} />
            <Field label="Lead time (días)" type="number" value={item.leadTime} onChange={(v) => onUpdate("leadTime", Number(v) || 0)} />
          </div>
          <Field label="Proveedor" value={item.proveedor} onChange={(v) => onUpdate("proveedor", v)} />
          {!confirming ? (
            <button style={styles.deleteBtn} onClick={() => setConfirming(true)}>🗑 Eliminar insumo</button>
          ) : (
            <div style={styles.confirmRow}>
              <span style={styles.confirmLabel}>¿Eliminar este insumo?</span>
              <button style={styles.confirmYes} onClick={onDelete}>Eliminar</button>
              <button style={styles.confirmNo} onClick={() => setConfirming(false)}>Cancelar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewItemForm({ onSave, onCancel }) {
  const [data, setData] = useState({
    nombre: "", categoria: "toma", unidad: "unid", stockActual: 0,
    stockMinimo: 10, consumoMensual: 0, precioUnit: 0, proveedor: "", leadTime: 7,
  });
  return (
    <div style={styles.newForm}>
      <Field label="Nombre" value={data.nombre} onChange={(v) => setData({ ...data, nombre: v })} />
      <div style={styles.fieldRow}>
        <Field label="Stock actual" type="number" value={data.stockActual} onChange={(v) => setData({ ...data, stockActual: Number(v) || 0 })} />
        <Field label="Stock mín" type="number" value={data.stockMinimo} onChange={(v) => setData({ ...data, stockMinimo: Number(v) || 0 })} />
      </div>
      <button onClick={() => { if (data.nombre) onSave(data); }} style={styles.saveBtn}>Crear</button>
      <button onClick={onCancel} style={styles.cancelBtn}>Cancelar</button>
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
function KPI({ label, value, color, big }) {
  return (
    <div style={{ ...styles.kpi, ...(big ? styles.kpiBig : {}) }}>
      <div style={styles.kpiLabel}>{label}</div>
      <div style={{ ...styles.kpiValue, color, ...(big ? { fontSize: 20 } : {}) }}>{value}</div>
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
  kpiGrid: { display: "flex", gap: 6, marginBottom: 6 },
  kpi: { flex: 1, background: "rgba(10,25,48,0.6)", border: "1px solid #0e2a45", borderRadius: 10, padding: "0.65rem 0.7rem" },
  kpiBig: { padding: "0.85rem" },
  kpiLabel: { fontSize: 9, color: "#5a8aaa", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 },
  kpiValue: { fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", lineHeight: 1 },
  main: { position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "0 1rem 3rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  filterRow: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" },
  filterChip: { background: "rgba(10,25,48,0.5)", border: "1px solid #1a3a5c", borderRadius: 20, padding: "5px 12px", fontSize: 11, color: "#7aaec8", cursor: "pointer", fontFamily: "inherit" },
  filterChipActive: { background: "rgba(251,191,36,0.15)", borderColor: "#fbbf24", color: "#fbbf24" },
  addBtn: { marginLeft: "auto", background: "rgba(52,211,153,0.15)", border: "1px solid #34d399", borderRadius: 8, padding: "5px 12px", fontSize: 11, color: "#34d399", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" },
  ocCard: { background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 12, padding: "0.85rem 1rem" },
  ocTitle: { fontSize: 12, fontWeight: 700, color: "#fbbf24", marginBottom: 10 },
  ocProv: { paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid rgba(14,42,69,0.5)" },
  ocProvHeader: { display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 },
  ocItem: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "#b8d4e8", padding: "2px 0" },
  itemList: { display: "flex", flexDirection: "column", gap: 6 },
  itemCard: { background: "rgba(10,25,48,0.6)", border: "1px solid #0e2a45", borderRadius: 10, padding: "0.75rem 0.9rem", cursor: "pointer" },
  itemTop: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
  itemName: { fontSize: 13, fontWeight: 700, color: "#e8f4ff", marginBottom: 2 },
  itemMeta: { fontSize: 11, color: "#5a8aaa" },
  statusTag: { fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 4, border: "1px solid", flexShrink: 0 },
  stockBar: { height: 4, background: "#0e2a45", borderRadius: 2, overflow: "hidden" },
  stockBarFill: { height: "100%", borderRadius: 2, transition: "width 0.4s" },
  modalBg: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 },
  modal: { background: "#0a1929", border: "1px solid #1a3a5c", borderRadius: "14px 14px 0 0", width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid #0e2a45", position: "sticky", top: 0, background: "#0a1929", zIndex: 1 },
  modalTitle: { fontSize: 15, fontWeight: 700, color: "#e8f4ff", margin: 0 },
  closeBtn: { background: "none", border: "none", color: "#5a8aaa", fontSize: 24, cursor: "pointer", padding: 0, lineHeight: 1 },
  modalBody: { padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 10 },
  field: { display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 },
  fieldRow: { display: "flex", gap: 8 },
  fieldLabel: { fontSize: 10, color: "#5a8aaa", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 },
  fieldInput: { background: "rgba(5,15,30,0.7)", border: "1px solid #1a3a5c", borderRadius: 6, padding: "8px 10px", color: "#cde4f5", fontSize: 13, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  deleteBtn: { background: "transparent", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#f87171", cursor: "pointer", fontFamily: "inherit", marginTop: 8 },
  confirmRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" },
  confirmLabel: { fontSize: 12, color: "#f87171", width: "100%", marginBottom: 4 },
  confirmYes: { background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.4)", borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#f87171", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 },
  confirmNo: { background: "transparent", border: "1px solid #1a3a5c", borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#7aaec8", cursor: "pointer", fontFamily: "inherit" },
  newForm: { background: "rgba(10,25,48,0.8)", border: "1px solid #34d399", borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column", gap: 8 },
  saveBtn: { background: "#34d399", border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 12, color: "#0a1929", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" },
  cancelBtn: { background: "transparent", border: "1px solid #1a3a5c", borderRadius: 6, padding: "6px 12px", fontSize: 11, color: "#5a8aaa", cursor: "pointer", fontFamily: "inherit" },
};
