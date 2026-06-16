# Mapa de Calor — Factibilidad de Captación de Pacientes

**Clínica Galilea · Los Ángeles, Región del Biobío, Chile**

Herramienta de planificación que visualiza, sobre un mapa real de Los Ángeles, **dónde es
más factible que lleguen clientes/pacientes** a una clínica, combinando datos del Censo
2024 con factores de demanda de salud.

> ⚠️ **Proyecto paralelo.** Vive en su propia carpeta y **no toca ni depende** de la app
> `suite-clinica-galilea`. Borrarla o moverla no afecta el repositorio.

## Cómo abrirlo

Abre **`index.html`** con doble clic en cualquier navegador (Chrome, Edge, Firefox).
No necesita servidor ni instalación. Requiere conexión a internet para cargar el mapa
base (OpenStreetMap) y las librerías Leaflet desde CDN.

## Qué puedes hacer

- 🔍 **Buscar la dirección exacta** (buscador 🔍 arriba a la derecha del mapa): escribe
  *"Australian Southern College, Los Ángeles"* o *"Av. Padre Alberto Hurtado 195"* y la ⭐
  se posiciona ahí. La ubicación prevista es **junto a la Iglesia Adventista Galilea, sector
  Av. Padre Alberto Hurtado** (el marcador parte en una estimación de esa zona; afínala con el buscador).
- 📏 **Análisis de alcance (catchment):** anillos de 1/2/3 km y **% de población alcanzable**
  desde la clínica, más los competidores privados dentro del radio primario (2 km).
- ⭐ **Arrastrar el marcador de tu clínica** para ver cómo cambia la captación según su ubicación.
- 🎚️ **Ajustar los pesos** del modelo: densidad poblacional, nivel socioeconómico,
  adulto mayor (demanda crónica), cercanía y **saturación por competencia privada**.
- 🏥 **Ver la red de salud existente** (hospital, CESFAM y centros privados) para detectar
  vacíos de cobertura y zonas saturadas.
- 📊 Leer el **ranking de sectores** y los popups con la demografía de cada zona.

### Red de salud existente incluida

| Establecimiento | Tipo | Dirección |
|---|---|---|
| Hospital Base Dr. Víctor Ríos Ruiz | Público alta complejidad | Av. Ricardo Vicuña 147 |
| Centro Médico Andes Salud | Privado (competencia) | Av. Alemania 1129 |
| Centro Médico y Dental RedSalud | Privado (competencia) | Centro |
| CESFAM Norte | APS pública | Av. Los Ángeles 810, Orompello |
| CESFAM Sur Paillihue | APS pública | Juan Guzmán 437 |
| CESFAM Dr. Segismundo Iturra Taito | APS pública | Sector poniente |
| CESFAM Rural Santa Fe | APS pública | Santa Fe |

Solo los **centros privados** descuentan puntaje por saturación (compiten por el mismo
paciente Isapre / Fonasa libre elección); hospital y CESFAM se consideran complementarios.

## Datos (Censo 2024 — INE Chile)

| Indicador | Valor |
|---|---|
| Población comunal | **219.441** |
| Población urbana (74,7%) | ~163.922 |
| Mujeres / Hombres | 114.005 / 105.436 |
| Edad promedio | 37,6 años |
| Ranking regional | 2ª comuna más poblada del Biobío |
| Paillihue | Sector más denso, ≈25% de la ciudad (>50.000 hab.) |

## Metodología (resumen)

Para cada sector se calcula un **potencial de captación (0–100)**:

```
base   = wPob·(pob/pobMax) + wNSE·(nse/5) + wAM·(adultoMayor/5)
prox   = exp( -(distancia_a_clínica / 2600 m)² )
score  = base · ( (1 − wProx) + wProx · prox )
```

Los puntos del mapa de calor se esparcen proporcionalmente a la población del sector
para producir una mancha realista.

## Fuentes

- **Censo de Población y Vivienda 2024**, INE Chile — https://censo2024.ine.gob.cl/resultados/
- INE, primeros resultados Censo 2024 (envejecimiento, totales regionales).
- Biblioteca del Congreso Nacional (BCN), Reportes Comunales de Los Ángeles.
- Prensa local (El Contraste, La Tribuna) para caracterización de sectores (Paillihue).
- Mapa base © OpenStreetMap; visualización con Leaflet + Leaflet.heat.

## Limitaciones

- Los **totales comunales son oficiales (Censo 2024)**, pero la **distribución por sector**,
  los **índices socioeconómico y de adulto mayor** y las **coordenadas de sector** son
  **estimaciones de planificación** (centroides aproximados, no polígonos censales por manzana).
- Úsalo como apoyo a la decisión de localización, no como dato censal oficial a nivel de manzana.
- El **buscador** geocodifica con Nominatim/OpenStreetMap desde tu navegador; si una dirección
  no aparece, arrastra la ⭐ a mano.
- **Polígonos oficiales del INE (REDATAM):** la cartografía por zona censal del Censo 2024 no es
  descargable desde el entorno donde se generó este proyecto (red restringida), por lo que el
  alcance se calcula con los centroides de sector y radios en línea recta (no isócronas de manejo).
  Si más adelante quieres precisión por manzana, se puede cargar el GeoJSON oficial del INE como
  capa adicional en el navegador.
