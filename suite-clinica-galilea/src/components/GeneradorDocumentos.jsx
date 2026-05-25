import { useState, useMemo, useEffect } from "react";

const STORAGE_KEY = "documentos_seremi_v1";

const DEFAULTS = {
  razonSocial: "[Razón Social] SpA",
  rut: "[RUT empresa]",
  nombreFantasia: "Laboratorio Clínico Galilea",
  direccion: "Av. Padre Alberto Hurtado 0195",
  comuna: "Los Ángeles",
  region: "Biobío",
  representante: "[Nombre representante legal]",
  rutRepresentante: "[RUT representante]",
  directorTecnico: "[Nombre Director Técnico]",
  rutDirector: "[RUT DT]",
  profesionDT: "Tecnólogo Médico",
  registroDT: "[N° registro SS]",
  superficie: "65",
  horario: "Lunes a viernes 7:30 a 18:00 hrs; sábado 8:00 a 13:00 hrs",
  laboratorioRef: "[Nombre laboratorio de referencia]",
  empresaREAS: "[Empresa retiro REAS autorizada]",
  fecha: new Date().toISOString().slice(0, 10),
};

const DOCUMENTS = [
  {
    id: "memoria",
    title: "Memoria Descriptiva del Establecimiento",
    icon: "📋",
    color: "#a78bfa",
    desc: "Documento principal que describe el establecimiento. Requisito SEREMI.",
    generate: (d) => `MEMORIA DESCRIPTIVA DEL ESTABLECIMIENTO
SALA DE TOMA DE MUESTRAS - "${d.nombreFantasia}"

1. IDENTIFICACIÓN
Razón Social: ${d.razonSocial}
RUT: ${d.rut}
Nombre de Fantasía: ${d.nombreFantasia}
Dirección: ${d.direccion}, ${d.comuna}, Región de ${d.region}
Representante Legal: ${d.representante}, RUT ${d.rutRepresentante}

2. NATURALEZA DEL ESTABLECIMIENTO
El establecimiento corresponde a una sala externa de toma de muestras clínicas
(exámenes de laboratorio) que opera bajo la modalidad de derivación a un
laboratorio clínico de referencia autorizado. NO se procesan muestras en el
establecimiento.

3. SERVICIOS OFRECIDOS
- Toma de muestras de sangre (venosa y capilar)
- Recepción de muestras de orina y deposiciones
- Conservación y derivación de muestras al laboratorio de referencia
- Entrega de resultados (físico y/o digital)

4. INFRAESTRUCTURA Y SUPERFICIE
Superficie total: ${d.superficie} m² aproximados
Distribución:
- Sala de espera para pacientes
- Recepción / admisión
- Sala de toma de muestras (mínimo 6 m², con ventilación y lavamanos clínico)
- Baño público accesible
- Área de almacenamiento de insumos y equipos
- Zona de cadena de frío (refrigerador clínico)
- Área para contenedores REAS

5. EQUIPAMIENTO PRINCIPAL
- Sillón clínico de flebotomía
- Camilla clínica
- Refrigerador clínico con control de temperatura
- Termómetro calibrado
- Lavamanos clínico con grifería sin contacto
- Contenedores REAS diferenciados
- Insumos de bioseguridad (EPP)

6. RECURSOS HUMANOS
Director Técnico: ${d.directorTecnico}
RUT: ${d.rutDirector}
Profesión: ${d.profesionDT}
Registro Superintendencia de Salud: ${d.registroDT}

Personal de toma de muestras: Tecnólogo Médico y/o TENS capacitado en
flebotomía, REAS y bioseguridad.

7. HORARIO DE ATENCIÓN
${d.horario}

8. LABORATORIO DE REFERENCIA
Las muestras son derivadas al laboratorio de referencia ${d.laboratorioRef},
con quien se mantiene convenio vigente que incluye transporte refrigerado.

9. MANEJO DE RESIDUOS (REAS)
El establecimiento cumple con DS N°6/2009 sobre manejo de Residuos de
Establecimientos de Atención en Salud. El retiro de REAS se realiza mediante
contrato con ${d.empresaREAS}, empresa autorizada por la autoridad sanitaria.

10. PROTOCOLOS Y MANUALES
El establecimiento cuenta con los siguientes documentos formales:
- Reglamento Interno
- Manual de Procedimientos de Toma de Muestras
- Protocolo de Manejo de REAS
- Protocolo de Cadena de Frío
- Protocolo de Bioseguridad y EPP

11. DECLARACIÓN
El representante legal declara que el establecimiento cumple con la
normativa sanitaria vigente, incluyendo DS N°58/2008 sobre autorización
sanitaria de establecimientos de salud.

${d.fecha}

_______________________________
${d.representante}
Representante Legal
${d.razonSocial}`,
  },
  {
    id: "reglamento",
    title: "Reglamento Interno del Establecimiento",
    icon: "📜",
    color: "#38bdf8",
    desc: "Reglas internas de funcionamiento. Exigido por SEREMI.",
    generate: (d) => `REGLAMENTO INTERNO
"${d.nombreFantasia}"
${d.razonSocial} - RUT ${d.rut}

TÍTULO I: DISPOSICIONES GENERALES

Artículo 1°. El presente Reglamento Interno establece las normas de
funcionamiento de la Sala de Toma de Muestras "${d.nombreFantasia}",
ubicada en ${d.direccion}, ${d.comuna}.

Artículo 2°. El establecimiento se rige por las normativas sanitarias
vigentes en Chile, en particular el DS N°58/2008 del Ministerio de Salud.

TÍTULO II: DEL FUNCIONAMIENTO

Artículo 3°. Horario de atención: ${d.horario}.

Artículo 4°. Los servicios ofrecidos son exclusivamente toma de muestras
clínicas para derivación a laboratorio de referencia. No se realiza
procesamiento de muestras en el establecimiento.

Artículo 5°. El establecimiento cuenta con Director Técnico responsable,
${d.directorTecnico}, quien supervisa el cumplimiento de los protocolos
clínicos y sanitarios.

TÍTULO III: DERECHOS Y DEBERES DE LOS PACIENTES

Artículo 6°. Todo paciente tiene derecho a:
a) Recibir atención respetuosa y digna
b) Conocer la identidad del personal que lo atiende
c) Recibir información clara sobre procedimientos a realizar
d) Confidencialidad de su información clínica conforme Ley 20.584
e) Acceso a sus resultados en plazo informado
f) Presentar reclamos o sugerencias

Artículo 7°. El paciente deberá:
a) Presentar orden médica vigente y documentos de identificación
b) Cumplir con preparaciones previas (ayuno, etc.) cuando corresponda
c) Mantener un trato respetuoso con el personal y otros pacientes
d) Respetar el orden de atención y el horario

TÍTULO IV: DEL PERSONAL

Artículo 8°. El personal del establecimiento deberá:
a) Mantener certificaciones y registros profesionales vigentes
b) Cumplir con protocolos de bioseguridad y EPP
c) Mantener la confidencialidad de información de pacientes
d) Participar en capacitaciones continuas

TÍTULO V: BIOSEGURIDAD Y PROTOCOLOS

Artículo 9°. Todo el personal clínico debe utilizar EPP conforme al
Protocolo de Bioseguridad institucional.

Artículo 10°. El manejo de REAS se rige por el Protocolo institucional
basado en DS N°6/2009.

Artículo 11°. La cadena de frío se controla mediante registro de
temperatura mínimo dos veces al día, conforme Protocolo de Cadena de Frío.

TÍTULO VI: RECLAMOS Y SUGERENCIAS

Artículo 12°. Existirá un libro de reclamos y sugerencias disponible
para los pacientes. Los reclamos serán respondidos en un plazo máximo
de 15 días hábiles.

TÍTULO VII: DISPOSICIONES FINALES

Artículo 13°. Este reglamento puede ser modificado por el representante
legal, debiendo informarse a la Autoridad Sanitaria correspondiente.

Aprobado en ${d.comuna}, ${d.fecha}

_______________________________
${d.representante}
Representante Legal`,
  },
  {
    id: "reas",
    title: "Protocolo de Manejo de REAS",
    icon: "♻️",
    color: "#fbbf24",
    desc: "Protocolo según DS N°6/2009. Crítico para autorización.",
    generate: (d) => `PROTOCOLO DE MANEJO DE RESIDUOS DE ESTABLECIMIENTOS DE ATENCIÓN EN SALUD (REAS)
"${d.nombreFantasia}" - ${d.razonSocial}

MARCO NORMATIVO
Decreto Supremo N°6/2009 MINSAL - Reglamento sobre Manejo de Residuos de
Establecimientos de Atención de Salud.

1. CLASIFICACIÓN DE RESIDUOS

1.1. Residuos Asimilables a Domiciliarios (RA)
   - Papel, cartón, envases plásticos no contaminados
   - Disposición: bolsas negras, contenedor común

1.2. Residuos Especiales (RES)
   1.2.1. Residuos Infecciosos
      - Material con sangre o fluidos corporales (algodones, gasas)
      - Disposición: bolsas amarillas con símbolo de riesgo biológico
   1.2.2. Residuos Cortopunzantes
      - Agujas, lancetas, hojas de bisturí
      - Disposición: contenedor rígido amarillo "cortopunzantes"
   1.2.3. Residuos Líquidos
      - Tubos con muestras procesadas (cuando aplique)
      - Disposición: contenedor rígido sellado

2. SEGREGACIÓN EN EL ORIGEN

Cada zona de generación cuenta con los contenedores necesarios identificados
con simbología y código de colores conforme a la normativa.

3. ALMACENAMIENTO INTERNO

3.1. Tiempo máximo de almacenamiento: 48 horas a temperatura ambiente,
o 7 días refrigerado.
3.2. Zona específica de acopio: área cerrada, ventilada, identificada,
con acceso restringido al personal autorizado.

4. RETIRO Y DISPOSICIÓN FINAL

Empresa contratada autorizada por SEREMI: ${d.empresaREAS}
Frecuencia de retiro: a definir según volumen (semanal mínimo).
Documentación: cada retiro genera certificado/manifiesto que se conserva
durante 5 años en el establecimiento.

5. CAPACITACIÓN

Todo el personal recibe capacitación en manejo de REAS al ingreso y
actualizaciones anuales. La capacitación queda registrada en archivo
del personal.

6. RESPONSABLE

El Director Técnico, ${d.directorTecnico}, es el responsable del
cumplimiento del presente protocolo.

7. ELEMENTOS DE PROTECCIÓN PERSONAL (EPP)

Para manipulación de REAS:
- Guantes resistentes a perforación
- Mascarilla
- Delantal impermeable
- Calzado cerrado

8. SITUACIONES DE DERRAME

En caso de derrame de material biológico:
1. Acordonar el área
2. Cubrir con material absorbente (compresas, papel)
3. Aplicar hipoclorito de sodio al 0.5%
4. Esperar 10 minutos
5. Retirar con guantes y disponer como REAS infeccioso
6. Limpiar superficie con desinfectante

9. REGISTROS

Se llevan los siguientes registros (formato físico y/o digital):
- Bitácora de retiros (fecha, kilos, transportista, certificado N°)
- Capacitaciones realizadas al personal
- Incidentes ocurridos
- Mantenimiento de contenedores

${d.fecha}

_______________________________
${d.directorTecnico}
Director Técnico - ${d.profesionDT}
Registro SS N° ${d.registroDT}`,
  },
  {
    id: "cadenafrio",
    title: "Protocolo de Cadena de Frío",
    icon: "❄️",
    color: "#06b6d4",
    desc: "Conservación de muestras. Crítico para validez de resultados.",
    generate: (d) => `PROTOCOLO DE CADENA DE FRÍO Y CONSERVACIÓN DE MUESTRAS
"${d.nombreFantasia}"

OBJETIVO
Garantizar la conservación adecuada de las muestras biológicas desde su
toma hasta su entrega al laboratorio de referencia, manteniendo la
integridad de los analitos.

ALCANCE
Aplica a todas las muestras clínicas que requieren refrigeración:
sangre con anticoagulante, suero/plasma, orina, otras.

EQUIPAMIENTO
- Refrigerador clínico exclusivo para muestras (2-8°C)
- Termómetro de máxima/mínima calibrado
- Termómetro digital de respaldo
- Contenedores isotérmicos con gel refrigerante para transporte

PROCEDIMIENTO

1. CONTROL DE TEMPERATURA
1.1. Registrar temperatura del refrigerador al inicio y al cierre de
la jornada (mínimo 2 veces al día).
1.2. Rango aceptable: 2°C a 8°C.
1.3. Registrar en planilla de control diaria.

2. RECEPCIÓN Y ETIQUETADO
2.1. Toda muestra debe etiquetarse inmediatamente después de la toma con:
   - Nombre completo del paciente
   - RUT
   - Fecha y hora de toma
   - Código de identificación
2.2. Verificación de identidad antes y después de la toma.

3. ALMACENAMIENTO
3.1. Muestras refrigeradas se almacenan en gradilla identificada
dentro del refrigerador clínico.
3.2. No mezclar con alimentos, bebidas o medicamentos.
3.3. Tiempo máximo antes del retiro: según convenio con laboratorio
(generalmente 4-24 horas).

4. TRANSPORTE
4.1. Las muestras se entregan al transportista del laboratorio de
referencia en contenedor isotérmico con gel refrigerante.
4.2. Se firma acta/guía de despacho con: cantidad, fecha, hora, temperatura.
4.3. El transportista debe estar identificado y autorizado por el
laboratorio de referencia ${d.laboratorioRef}.

5. ACCIONES ANTE DESVIACIONES
5.1. Si la temperatura supera el rango:
   - Verificar funcionamiento del equipo
   - Trasladar muestras a refrigerador de respaldo (si existe)
   - Documentar incidente
   - Evaluar viabilidad de muestras con DT
   - Comunicar al laboratorio de referencia

6. MANTENIMIENTO
6.1. Limpieza interior del refrigerador: semanal
6.2. Verificación de sellos y empaques: mensual
6.3. Calibración del termómetro: anual (con empresa certificada)
6.4. Mantenimiento técnico: anual

7. REGISTROS
Se conservan por mínimo 2 años:
- Planilla diaria de temperatura
- Certificados de calibración
- Registro de incidentes
- Actas de entrega de muestras

8. RESPONSABLE
Director Técnico: ${d.directorTecnico}

${d.fecha}

_______________________________
${d.directorTecnico}
Director Técnico`,
  },
  {
    id: "bioseguridad",
    title: "Protocolo de Bioseguridad y EPP",
    icon: "🛡️",
    color: "#10b981",
    desc: "Prevención de riesgos biológicos del personal.",
    generate: (d) => `PROTOCOLO DE BIOSEGURIDAD Y USO DE EPP
"${d.nombreFantasia}"

OBJETIVO
Establecer las medidas de bioseguridad para proteger al personal,
pacientes y comunidad ante riesgos biológicos derivados de la
actividad clínica.

PRINCIPIOS GENERALES
- Todo paciente y muestra debe considerarse potencialmente infeccioso.
- Aplicación de precauciones estándar en todo momento.
- Uso obligatorio de EPP según procedimiento.

ELEMENTOS DE PROTECCIÓN PERSONAL (EPP)

1. EN TOMA DE MUESTRAS
   - Guantes desechables de nitrilo o látex (cambio entre pacientes)
   - Mascarilla quirúrgica
   - Delantal manga larga
   - Lentes de seguridad (cuando hay riesgo de salpicadura)

2. EN MANEJO DE REAS
   - Guantes de protección reforzados
   - Mascarilla
   - Delantal impermeable
   - Calzado cerrado

3. EN LIMPIEZA Y DESINFECCIÓN
   - Guantes de protección
   - Mascarilla
   - Delantal impermeable
   - Lentes de seguridad

LAVADO DE MANOS
- Antes y después de cada paciente
- Antes y después de usar guantes
- Después de manipular muestras
- Técnica: solución antiséptica o alcohol gel 70%

DESINFECCIÓN DE SUPERFICIES
- Superficies de trabajo: entre cada paciente, con alcohol 70%
- Sillón/camilla: entre cada paciente, con desinfectante hospitalario
- Pisos: al inicio y término de jornada, con hipoclorito 0.5%

VACUNAS RECOMENDADAS AL PERSONAL
- Hepatitis B (esquema completo)
- Influenza (anual)
- Tétanos (refuerzo cada 10 años)
- SARS-CoV-2 (esquema vigente)

ACCIDENTES CON MATERIAL CORTOPUNZANTE
En caso de pinchazo o exposición a fluidos biológicos:

1. Lavado inmediato con abundante agua y jabón (no exprimir).
2. Aplicar antiséptico.
3. Informar al Director Técnico de inmediato.
4. Acudir a Mutual de Seguridad o servicio de urgencia para
evaluación de riesgo de transmisión.
5. Notificar al paciente fuente (con consentimiento) para
serología si corresponde.
6. Completar formulario DIAT (Denuncia Individual de Accidente
del Trabajo).
7. Seguimiento serológico según protocolo médico.

CAPACITACIÓN
Todo el personal recibe capacitación en bioseguridad:
- Al ingreso al establecimiento
- Actualización anual
- Cuando hay cambios en procedimientos

RESPONSABLE
Director Técnico: ${d.directorTecnico}

${d.fecha}

_______________________________
${d.directorTecnico}
Director Técnico`,
  },
  {
    id: "procedimientos",
    title: "Manual de Procedimientos - Toma de Muestras",
    icon: "🩸",
    color: "#ef4444",
    desc: "Procedimientos clínicos detallados.",
    generate: (d) => `MANUAL DE PROCEDIMIENTOS - TOMA DE MUESTRAS
"${d.nombreFantasia}"

1. RECEPCIÓN DEL PACIENTE

1.1. Verificación de orden médica:
- Identificación legible del médico y paciente
- Exámenes solicitados claros
- Diagnóstico y/o sospecha clínica
- Fecha de emisión vigente

1.2. Identificación del paciente:
- Solicitar cédula de identidad
- Verificar nombre completo y RUT
- Confirmar datos con el paciente verbalmente

1.3. Información al paciente:
- Procedimiento a realizar
- Tiempo aproximado
- Indicaciones post-procedimiento
- Plazo y modalidad de entrega de resultados

2. PREPARACIÓN DEL PACIENTE

2.1. Verificación de preparaciones previas:
- Ayuno (8-12 hrs según examen)
- Suspensión de medicamentos (cuando corresponda)
- Restricciones de actividad física

2.2. Si el paciente no cumple preparaciones, evaluar con el DT si se
toma la muestra o se reagenda.

3. TOMA DE MUESTRA DE SANGRE VENOSA

3.1. Materiales: tubos según examen, aguja, mariposa o sistema vacío,
ligadura, algodón, alcohol 70%, parche.

3.2. Procedimiento:
a) Posicionar al paciente cómodamente, con brazo extendido y apoyado
b) Aplicar ligadura 7-10 cm sobre el sitio de punción
c) Seleccionar vena adecuada (basílica, mediana, cefálica)
d) Desinfectar zona con alcohol 70% en movimiento circular
e) No volver a palpar la zona desinfectada
f) Realizar punción con bisel hacia arriba en ángulo 15-30°
g) Llenar tubos en orden recomendado por CLSI
h) Soltar ligadura antes de retirar la aguja
i) Retirar aguja y aplicar presión con algodón
j) Sellar con parche
k) Desechar aguja en contenedor de cortopunzantes inmediatamente
l) Homogeneizar tubos por inversión suave

3.3. Orden de extracción (CLSI):
1. Hemocultivos
2. Tubo citrato (azul)
3. Tubo seco/gel (rojo/amarillo)
4. Tubo heparina (verde)
5. Tubo EDTA (morado)
6. Tubo fluoruro (gris)

4. TOMA DE MUESTRA DE ORINA
- Orina aislada: primera orina de la mañana, chorro medio
- Urocultivo: aseo genital previo, chorro medio en frasco estéril
- 24 horas: instruir al paciente correctamente

5. ETIQUETADO

Toda muestra debe etiquetarse INMEDIATAMENTE después de tomada, con:
- Nombre completo y RUT del paciente
- Fecha y hora de toma
- Código de identificación interno
- Examen(es) solicitado(s)

NUNCA etiquetar tubos antes de tomar la muestra.

6. CONSERVACIÓN Y DERIVACIÓN

Conforme Protocolo de Cadena de Frío.

7. SITUACIONES ESPECIALES

7.1. Punción dificultosa: máximo 2 intentos por profesional. Solicitar
apoyo al DT si hay dificultad.

7.2. Hematoma: aplicar presión y frío local. Documentar.

7.3. Lipotimia/desmayo: posicionar al paciente en decúbito, elevar
piernas, controlar signos vitales.

7.4. Paciente pediátrico: requerir presencia de tutor responsable.

8. ENTREGA DE RESULTADOS

- Plazo informado al paciente según convenio con laboratorio referencia
- Entrega solo a paciente o autorizado con poder simple
- Resultado digital con clave (cuando corresponda)
- Confidencialidad conforme Ley 20.584

9. RESPONSABLE

Director Técnico: ${d.directorTecnico}, ${d.profesionDT}

${d.fecha}

_______________________________
${d.directorTecnico}
Director Técnico
Registro SS N° ${d.registroDT}`,
  },
];

export default function GeneradorDocumentos() {
  const [data, setData] = useState(DEFAULTS);
  const [selected, setSelected] = useState("memoria");
  const [viewMode, setViewMode] = useState("editar");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setData({ ...DEFAULTS, ...JSON.parse(saved) });
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }, [data, loaded]);

  const update = (key, val) => setData((p) => ({ ...p, [key]: val }));

  const currentDoc = DOCUMENTS.find((d) => d.id === selected);
  const generatedText = useMemo(() => currentDoc?.generate(data) || "", [currentDoc, data]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      alert("✓ Documento copiado al portapapeles");
    } catch {
      alert("No se pudo copiar. Selecciona el texto manualmente.");
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([generatedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentDoc.id}_${data.fecha}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const completedFields = Object.values(data).filter((v) => v && !v.toString().startsWith("[")).length;
  const totalFields = Object.keys(data).length;
  const completionPct = Math.round((completedFields / totalFields) * 100);

  return (
    <div style={styles.root}>
      <div style={styles.bg} />
      <header style={styles.header}>
        <div style={styles.badge}>Documentos SEREMI · DS N°58/2008</div>
        <h1 style={styles.title}>Generador de Documentos</h1>
        <p style={styles.subtitle}>Llena una vez, genera todos los documentos para autorización sanitaria</p>

        <div style={styles.statsCard}>
          <div style={styles.statsLabel}>Datos completados</div>
          <div style={styles.statsRow}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${completionPct}%` }} />
            </div>
            <span style={styles.statsValue}>{completedFields}/{totalFields}</span>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.tabs}>
          <button onClick={() => setViewMode("editar")} style={{ ...styles.tab, ...(viewMode === "editar" ? styles.tabActive : {}) }}>
            ✏️ Datos
          </button>
          <button onClick={() => setViewMode("generar")} style={{ ...styles.tab, ...(viewMode === "generar" ? styles.tabActive : {}) }}>
            📄 Generar
          </button>
        </div>

        {viewMode === "editar" ? (
          <div style={styles.formCard}>
            <Section title="Empresa">
              <FormField label="Razón Social" value={data.razonSocial} onChange={(v) => update("razonSocial", v)} />
              <FormField label="RUT empresa" value={data.rut} onChange={(v) => update("rut", v)} />
              <FormField label="Nombre de fantasía" value={data.nombreFantasia} onChange={(v) => update("nombreFantasia", v)} />
              <FormField label="Dirección" value={data.direccion} onChange={(v) => update("direccion", v)} />
              <div style={styles.fieldRow}>
                <FormField label="Comuna" value={data.comuna} onChange={(v) => update("comuna", v)} />
                <FormField label="Región" value={data.region} onChange={(v) => update("region", v)} />
              </div>
            </Section>

            <Section title="Representante legal">
              <FormField label="Nombre" value={data.representante} onChange={(v) => update("representante", v)} />
              <FormField label="RUT" value={data.rutRepresentante} onChange={(v) => update("rutRepresentante", v)} />
            </Section>

            <Section title="Director Técnico">
              <FormField label="Nombre completo" value={data.directorTecnico} onChange={(v) => update("directorTecnico", v)} />
              <div style={styles.fieldRow}>
                <FormField label="RUT" value={data.rutDirector} onChange={(v) => update("rutDirector", v)} />
                <FormField label="Profesión" value={data.profesionDT} onChange={(v) => update("profesionDT", v)} />
              </div>
              <FormField label="Registro Sup. de Salud" value={data.registroDT} onChange={(v) => update("registroDT", v)} />
            </Section>

            <Section title="Operación">
              <FormField label="Superficie total (m²)" value={data.superficie} onChange={(v) => update("superficie", v)} />
              <FormField label="Horario de atención" value={data.horario} onChange={(v) => update("horario", v)} />
              <FormField label="Laboratorio de referencia" value={data.laboratorioRef} onChange={(v) => update("laboratorioRef", v)} />
              <FormField label="Empresa retiro REAS" value={data.empresaREAS} onChange={(v) => update("empresaREAS", v)} />
              <FormField label="Fecha de emisión" type="date" value={data.fecha} onChange={(v) => update("fecha", v)} />
            </Section>
          </div>
        ) : (
          <>
            <div style={styles.docList}>
              {DOCUMENTS.map((doc) => (
                <button key={doc.id} onClick={() => setSelected(doc.id)}
                  style={{
                    ...styles.docCard,
                    ...(selected === doc.id ? { borderColor: doc.color, background: `${doc.color}10` } : {}),
                  }}>
                  <span style={{ fontSize: 22 }}>{doc.icon}</span>
                  <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                    <div style={{ ...styles.docTitle, color: selected === doc.id ? doc.color : "#cde4f5" }}>
                      {doc.title}
                    </div>
                    <div style={styles.docDesc}>{doc.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <div style={styles.actions}>
              <button style={styles.actionBtn} onClick={copyToClipboard}>📋 Copiar texto</button>
              <button style={styles.actionBtnPrimary} onClick={downloadTxt}>⬇ Descargar .txt</button>
            </div>

            <div style={styles.preview}>
              <div style={styles.previewHeader}>
                <span style={{ color: currentDoc?.color }}>{currentDoc?.icon}</span>
                <strong style={styles.previewTitle}>{currentDoc?.title}</strong>
              </div>
              <pre style={styles.previewText}>{generatedText}</pre>
            </div>
          </>
        )}

        <div style={styles.tipCard}>
          <div style={styles.tipTitle}>💡 Cómo usar estos documentos</div>
          <div style={styles.tipText}>
            Estos son borradores conforme normativa chilena. Descárgalos como .txt,
            edítalos en Word, agrega timbres/firmas y presenta a SEREMI Biobío.
            <strong style={{ color: "#fbbf24" }}> Revisa con tu abogado o asesor sanitario</strong> antes de presentar.
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>{title}</div>
      <div style={styles.sectionContent}>{children}</div>
    </div>
  );
}

function FormField({ label, value, onChange, type = "text" }) {
  const isPlaceholder = value && value.toString().startsWith("[");
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        style={{ ...styles.fieldInput, ...(isPlaceholder ? styles.fieldInputPlaceholder : {}) }} />
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#050f1e", fontFamily: "'DM Sans', sans-serif", color: "#cde4f5", position: "relative" },
  bg: { position: "fixed", inset: 0, background: "radial-gradient(ellipse 70% 50% at 20% 0%, #1a2f5e 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 },
  header: { position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "2rem 1rem 1.5rem" },
  badge: { display: "inline-block", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 4, padding: "2px 8px", marginBottom: 8 },
  title: { fontSize: "1.9rem", fontWeight: 800, margin: 0, color: "#e8f4ff", letterSpacing: "-0.02em", lineHeight: 1.1 },
  subtitle: { fontSize: 13, color: "#5a8aaa", margin: "4px 0 1.25rem" },
  statsCard: { background: "rgba(10,25,48,0.6)", border: "1px solid #0e2a45", borderRadius: 10, padding: "0.85rem 1rem" },
  statsLabel: { fontSize: 10, color: "#5a8aaa", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 },
  statsRow: { display: "flex", alignItems: "center", gap: 10 },
  progressBar: { flex: 1, height: 6, background: "#0e2a45", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #38bdf8, #34d399)", borderRadius: 3, transition: "width 0.4s" },
  statsValue: { fontSize: 13, fontWeight: 700, color: "#34d399", fontVariantNumeric: "tabular-nums" },
  main: { position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "0 1rem 3rem", display: "flex", flexDirection: "column", gap: "1rem" },
  tabs: { display: "flex", gap: 4, padding: 4, background: "rgba(10,25,48,0.5)", borderRadius: 10, border: "1px solid #0e2a45" },
  tab: { flex: 1, background: "transparent", border: "none", padding: "8px 12px", fontSize: 12, color: "#5a8aaa", cursor: "pointer", borderRadius: 6, fontWeight: 600, fontFamily: "inherit" },
  tabActive: { background: "rgba(239,68,68,0.15)", color: "#ef4444" },
  formCard: { background: "rgba(10,25,48,0.6)", border: "1px solid #0e2a45", borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column", gap: "1.25rem" },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.08em", paddingBottom: 6, borderBottom: "1px solid rgba(14,42,69,0.6)" },
  sectionContent: { display: "flex", flexDirection: "column", gap: 8 },
  fieldRow: { display: "flex", gap: 8 },
  field: { display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 },
  fieldLabel: { fontSize: 10, color: "#5a8aaa", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 },
  fieldInput: { background: "rgba(5,15,30,0.7)", border: "1px solid #1a3a5c", borderRadius: 6, padding: "8px 10px", color: "#cde4f5", fontSize: 13, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  fieldInputPlaceholder: { borderColor: "rgba(248,113,113,0.4)", color: "#f87171" },
  docList: { display: "flex", flexDirection: "column", gap: 6 },
  docCard: { display: "flex", alignItems: "center", gap: 12, padding: "0.75rem 0.9rem", background: "rgba(10,25,48,0.6)", border: "1px solid #0e2a45", borderRadius: 10, cursor: "pointer", color: "inherit", fontFamily: "inherit", transition: "all 0.2s" },
  docTitle: { fontSize: 13, fontWeight: 700, marginBottom: 2 },
  docDesc: { fontSize: 10, color: "#5a8aaa", lineHeight: 1.4 },
  actions: { display: "flex", gap: 8 },
  actionBtn: { flex: 1, background: "transparent", border: "1px solid #1a3a5c", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#7aaec8", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" },
  actionBtnPrimary: { flex: 1, background: "rgba(52,211,153,0.15)", border: "1px solid #34d399", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#34d399", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" },
  preview: { background: "rgba(5,15,30,0.7)", border: "1px solid #0e2a45", borderRadius: 12, padding: "1rem", maxHeight: "60vh", overflowY: "auto" },
  previewHeader: { display: "flex", alignItems: "center", gap: 8, paddingBottom: 8, marginBottom: 12, borderBottom: "1px solid rgba(14,42,69,0.5)" },
  previewTitle: { fontSize: 12, color: "#cde4f5" },
  previewText: { fontSize: 11, lineHeight: 1.6, color: "#b8d4e8", whiteSpace: "pre-wrap", margin: 0, fontFamily: "monospace" },
  tipCard: { background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, padding: "0.85rem" },
  tipTitle: { fontSize: 12, fontWeight: 700, color: "#fbbf24", marginBottom: 6 },
  tipText: { fontSize: 12, color: "#cde4f5", lineHeight: 1.6 },
};
