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

- 🏥 **Arrastrar el marcador de la clínica** para ver cómo cambia la captación según su ubicación.
- 🎚️ **Ajustar los pesos** del modelo: densidad poblacional, nivel socioeconómico,
  adulto mayor (demanda crónica) y la importancia de la cercanía.
- 📊 Leer el **ranking de sectores** y los popups con la demografía de cada zona.

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
  Para precisión por zona censal, integrar la cartografía oficial del INE (GeoJSON REDATAM).
