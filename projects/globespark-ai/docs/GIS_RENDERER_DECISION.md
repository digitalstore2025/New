# GlobeSpark GIS Renderer Decision

## Decision
Keep the custom Canvas2D orthographic globe for the production V2 interaction surface. Add a pinned build-time Natural Earth TopoJSON fallback rather than replacing the stable renderer with WebGL/3D without an analytical requirement.

## Current resilience chain
1. Current world-scale GeoJSON source over HTTPS.
2. Browser Cache API last-good map copy.
3. Bundled `world-atlas@2.0.2` `countries-110m.json` fallback converted with `topojson-client@3.1.0`.
4. ISO numeric IDs are mapped to ISO alpha-2 using a Python-generated static table; Kosovo receives the existing `XK` compatibility fallback.
5. Country search remains an accessible non-spatial selection path.

The bundled package is a fallback, not the primary boundary dataset, because its Natural Earth source version is older than the current upstream data. This avoids trading availability for silent boundary staleness.

## Why Canvas remains primary
- It is already deployment-proven in the current environment.
- Country selection, rotation, tilt, zoom, reduced motion, keyboard controls and mobile interaction are supported without a large renderer migration.
- The current product needs country-level exploration, not terrain, photorealistic imagery or 3D Tiles.
- A renderer migration would add bundle/runtime complexity without a measured product benefit today.

## Cesium/WebGL promotion triggers
Evaluate CesiumJS or another GPU renderer only when at least one production requirement needs terrain, imagery layers, 3D Tiles, large geospatial point/line volumes, temporal geospatial layers, camera fly-to semantics, or analyst-grade map layer composition that Canvas cannot meet within performance budgets.

## Gate
No 3D migration is approved on visual novelty alone. It requires a benchmark against current interaction latency, bundle cost, mobile thermal/battery impact, accessibility fallback and deployment reliability.