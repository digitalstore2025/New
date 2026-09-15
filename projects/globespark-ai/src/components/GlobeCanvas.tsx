import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Compass,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { feature as topologyFeature } from 'topojson-client';
import bundledWorld from 'world-atlas/countries-110m.json';
import { ISO_NUMERIC_TO_ALPHA2 } from '../isoNumericToAlpha2';
import type {
  GeoFeature,
  MultiPolygonCoordinates,
  PolygonCoordinates,
  Position,
  SelectedCountry,
} from '../types';

const GEO_URL = 'https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson';
const DEG = Math.PI / 180;

type BundledTopology = { objects?: { countries?: unknown } };
type BundledFeature = GeoFeature & { id?: string | number };
type BundledFeatureCollection = { features?: BundledFeature[] };

function loadBundledMapData(): { features: GeoFeature[] } {
  const topology = bundledWorld as unknown as BundledTopology;
  const countriesObject = topology.objects?.countries;
  if (!countriesObject) return { features: [] };
  const collection = topologyFeature(topology, countriesObject) as BundledFeatureCollection;
  const features = Array.isArray(collection.features)
    ? collection.features.map(feature => {
        const numeric = feature.id == null ? '' : String(feature.id).padStart(3, '0');
        const name = safeName(feature);
        const code = ISO_NUMERIC_TO_ALPHA2[numeric] ?? (name === 'Kosovo' ? 'XK' : undefined);
        return {
          ...feature,
          properties: {
            ...feature.properties,
            ...(code ? { ISO_A2: code } : {}),
          },
        };
      })
    : [];
  return { features };
}

type FocusPoint = { longitude: number; latitude: number } | null;

type Props = {
  selectedCode?: string;
  focus: FocusPoint;
  onSelect: (country: SelectedCountry) => void;
  labels: {
    globeLabel: string;
    globeHint: string;
    mapUnavailable: string;
    controls: string;
    rotateLeft: string;
    rotateRight: string;
    rotateUp: string;
    rotateDown: string;
    zoomIn: string;
    zoomOut: string;
    resetGlobe: string;
  };
};

type ProjectedPoint = { x: number; y: number; z: number };

function safeName(feature: GeoFeature) {
  const raw = feature.properties?.ADMIN ?? feature.properties?.NAME ?? feature.properties?.name;
  return typeof raw === 'string' ? raw : '';
}

function safeCode(feature: GeoFeature) {
  const raw = feature.properties?.ISO_A2 ?? feature.properties?.iso_a2;
  return typeof raw === 'string' && /^[A-Z]{2}$/.test(raw) ? raw : undefined;
}

function polygonSets(feature: GeoFeature): PolygonCoordinates[] {
  if (!feature.geometry?.coordinates) return [];
  if (feature.geometry.type === 'Polygon') return [feature.geometry.coordinates as PolygonCoordinates];
  if (feature.geometry.type === 'MultiPolygon') return feature.geometry.coordinates as MultiPolygonCoordinates;
  return [];
}

function pointInRing(lon: number, lat: number, ring: Position[]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    let xi = ring[i][0];
    let xj = ring[j][0];
    const yi = ring[i][1];
    const yj = ring[j][1];
    while (xi - lon > 180) xi -= 360;
    while (xi - lon < -180) xi += 360;
    while (xj - lon > 180) xj -= 360;
    while (xj - lon < -180) xj += 360;
    const crosses = yi > lat !== yj > lat;
    const xAtLat = ((xj - xi) * (lat - yi)) / (yj - yi || Number.EPSILON) + xi;
    if (crosses && lon < xAtLat) inside = !inside;
  }
  return inside;
}

function featureContains(feature: GeoFeature, lon: number, lat: number) {
  return polygonSets(feature).some(polygon => {
    const outer = polygon[0];
    if (!outer || !pointInRing(lon, lat, outer)) return false;
    return !polygon.slice(1).some(hole => pointInRing(lon, lat, hole));
  });
}

async function loadMapData() {
  const cacheName = 'globespark-map-v1';
  const canCache = 'caches' in window;
  let cached: Response | undefined;
  if (canCache) {
    const cache = await caches.open(cacheName);
    cached = (await cache.match(GEO_URL)) ?? undefined;
  }
  try {
    const response = await fetch(GEO_URL, { mode: 'cors' });
    if (!response.ok) throw new Error('Map data unavailable');
    if (canCache) {
      const cache = await caches.open(cacheName);
      await cache.put(GEO_URL, response.clone());
    }
    return response.json() as Promise<{ features?: GeoFeature[] }>;
  } catch (err) {
    if (cached) {
      try {
        return (await cached.json()) as { features?: GeoFeature[] };
      } catch {
        // Fall through to the bundled map if browser cache is unreadable.
      }
    }
    const bundled = loadBundledMapData();
    if (bundled.features.length > 0) return bundled;
    throw err;
  }
}

export default function GlobeCanvas({ selectedCode, focus, onSelect, labels }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef(-18);
  const tiltRef = useRef(12);
  const zoomRef = useRef(1);
  const onSelectRef = useRef(onSelect);
  const pointerRef = useRef({ down: false, moved: false, x: 0, y: 0 });
  const [geoData, setGeoData] = useState<GeoFeature[]>([]);
  const [hovered, setHovered] = useState('');
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let active = true;
    void loadMapData()
      .then(data => {
        if (!active) return;
        const features = Array.isArray(data.features) ? data.features : [];
        setGeoData(features.filter(feature => safeName(feature)));
      })
      .catch(() => {
        if (active) setMapError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!focus) return;
    rotationRef.current = focus.longitude;
    tiltRef.current = Math.max(-58, Math.min(58, focus.latitude));
  }, [focus]);

  function adjustRotation(lonDelta: number, latDelta: number) {
    rotationRef.current += lonDelta;
    tiltRef.current = Math.max(-58, Math.min(58, tiltRef.current + latDelta));
  }

  function adjustZoom(delta: number) {
    zoomRef.current = Math.max(0.72, Math.min(1.6, zoomRef.current + delta));
  }

  function reset() {
    rotationRef.current = -18;
    tiltRef.current = 12;
    zoomRef.current = 1;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let width = 640;
    let height = 640;
    let baseRadius = 250;
    let frame = 0;
    let lastTime = performance.now();
    let hovering = '';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(320, rect.width);
      height = Math.max(360, rect.height);
      baseRadius = Math.min(width, height) * 0.41;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function radius() {
      return baseRadius * zoomRef.current;
    }

    function project(lon: number, lat: number): ProjectedPoint {
      const currentRadius = radius();
      const lambda = (lon - rotationRef.current) * DEG;
      const phi = lat * DEG;
      const phi0 = tiltRef.current * DEG;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);
      const cosPhi0 = Math.cos(phi0);
      const sinPhi0 = Math.sin(phi0);
      const x = width / 2 + currentRadius * cosPhi * Math.sin(lambda);
      const y = height / 2 - currentRadius * (cosPhi0 * sinPhi - sinPhi0 * cosPhi * Math.cos(lambda));
      const z = sinPhi0 * sinPhi + cosPhi0 * cosPhi * Math.cos(lambda);
      return { x, y, z };
    }

    function inverseProject(x: number, y: number) {
      const currentRadius = radius();
      const nx = (x - width / 2) / currentRadius;
      const ny = (height / 2 - y) / currentRadius;
      const rho = Math.sqrt(nx * nx + ny * ny);
      if (rho > 1) return null;
      const phi0 = tiltRef.current * DEG;
      if (rho < 1e-8) return { lon: rotationRef.current, lat: tiltRef.current };
      const c = Math.asin(Math.min(1, rho));
      const sinC = Math.sin(c);
      const cosC = Math.cos(c);
      const lat = Math.asin(cosC * Math.sin(phi0) + (ny * sinC * Math.cos(phi0)) / rho);
      const lon = rotationRef.current * DEG + Math.atan2(nx * sinC, rho * Math.cos(phi0) * cosC - ny * Math.sin(phi0) * sinC);
      return { lon: ((((lon / DEG) + 180) % 360) + 360) % 360 - 180, lat: lat / DEG };
    }

    function drawGrid() {
      context.save();
      context.strokeStyle = 'rgba(125, 211, 252, .095)';
      context.lineWidth = 0.7;
      for (let lat = -60; lat <= 60; lat += 30) {
        context.beginPath();
        let open = false;
        for (let lon = -180; lon <= 180; lon += 4) {
          const point = project(lon, lat);
          if (point.z > 0) {
            if (!open) context.moveTo(point.x, point.y);
            else context.lineTo(point.x, point.y);
            open = true;
          } else open = false;
        }
        context.stroke();
      }
      for (let lon = -180; lon < 180; lon += 30) {
        context.beginPath();
        let open = false;
        for (let lat = -88; lat <= 88; lat += 3) {
          const point = project(lon, lat);
          if (point.z > 0) {
            if (!open) context.moveTo(point.x, point.y);
            else context.lineTo(point.x, point.y);
            open = true;
          } else open = false;
        }
        context.stroke();
      }
      context.restore();
    }

    function drawCountries() {
      for (const feature of geoData) {
        const active = Boolean(selectedCode && selectedCode === safeCode(feature));
        context.save();
        context.strokeStyle = active ? 'rgba(103, 232, 249, .98)' : 'rgba(147, 197, 253, .52)';
        context.fillStyle = active ? 'rgba(34, 211, 238, .30)' : 'rgba(37, 99, 235, .14)';
        context.lineWidth = active ? 1.8 : 0.72;
        if (active) {
          context.shadowColor = 'rgba(103, 232, 249, .68)';
          context.shadowBlur = 14;
        }
        for (const polygon of polygonSets(feature)) {
          const ring = polygon[0];
          if (!ring) continue;
          context.beginPath();
          let open = false;
          let visiblePoints = 0;
          for (const [lon, lat] of ring) {
            const point = project(lon, lat);
            if (point.z > 0.012) {
              if (!open) context.moveTo(point.x, point.y);
              else context.lineTo(point.x, point.y);
              open = true;
              visiblePoints += 1;
            } else open = false;
          }
          if (visiblePoints > 2) {
            context.fill();
            context.stroke();
          }
        }
        context.restore();
      }
    }

    function draw(now: number) {
      const elapsed = Math.min(50, now - lastTime);
      lastTime = now;
      if (!pointerRef.current.down && !reducedMotion) rotationRef.current = (rotationRef.current + elapsed * 0.0032) % 360;
      context.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const currentRadius = radius();
      context.save();
      context.shadowColor = 'rgba(56, 189, 248, .3)';
      context.shadowBlur = 44;
      context.beginPath();
      context.arc(cx, cy, currentRadius + 2, 0, Math.PI * 2);
      context.fillStyle = 'rgba(8, 47, 73, .18)';
      context.fill();
      context.restore();
      const ocean = context.createRadialGradient(cx - currentRadius * 0.32, cy - currentRadius * 0.36, currentRadius * 0.08, cx, cy, currentRadius);
      ocean.addColorStop(0, '#1d5db4');
      ocean.addColorStop(0.52, '#0b2f6d');
      ocean.addColorStop(1, '#031127');
      context.beginPath();
      context.arc(cx, cy, currentRadius, 0, Math.PI * 2);
      context.fillStyle = ocean;
      context.fill();
      context.save();
      context.beginPath();
      context.arc(cx, cy, currentRadius, 0, Math.PI * 2);
      context.clip();
      drawGrid();
      drawCountries();
      context.restore();
      const shade = context.createLinearGradient(cx - currentRadius, cy, cx + currentRadius, cy);
      shade.addColorStop(0, 'rgba(0,0,0,0)');
      shade.addColorStop(0.64, 'rgba(0,0,0,.04)');
      shade.addColorStop(1, 'rgba(0,0,0,.58)');
      context.beginPath();
      context.arc(cx, cy, currentRadius, 0, Math.PI * 2);
      context.fillStyle = shade;
      context.fill();
      context.strokeStyle = 'rgba(125, 211, 252, .42)';
      context.lineWidth = 1.1;
      context.stroke();
      frame = requestAnimationFrame(draw);
    }

    function countryAt(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const point = inverseProject(clientX - rect.left, clientY - rect.top);
      if (!point) return null;
      for (let i = geoData.length - 1; i >= 0; i -= 1) {
        if (featureContains(geoData[i], point.lon, point.lat)) return geoData[i];
      }
      return null;
    }

    function onPointerDown(event: PointerEvent) {
      pointerRef.current = { down: true, moved: false, x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
    }

    function onPointerMove(event: PointerEvent) {
      const drag = pointerRef.current;
      if (drag.down) {
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
        rotationRef.current -= dx * 0.32;
        tiltRef.current = Math.max(-58, Math.min(58, tiltRef.current + dy * 0.2));
        drag.x = event.clientX;
        drag.y = event.clientY;
        return;
      }
      const feature = countryAt(event.clientX, event.clientY);
      const nextHover = feature ? safeName(feature) : '';
      canvas.style.cursor = feature ? 'pointer' : 'grab';
      if (nextHover !== hovering) {
        hovering = nextHover;
        setHovered(nextHover);
      }
    }

    function onPointerUp(event: PointerEvent) {
      const wasMoved = pointerRef.current.moved;
      pointerRef.current.down = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      canvas.style.cursor = 'grab';
      if (wasMoved) return;
      const feature = countryAt(event.clientX, event.clientY);
      const name = feature ? safeName(feature) : '';
      if (feature && name) onSelectRef.current({ name, code: safeCode(feature) });
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    };
  }, [geoData, selectedCode]);

  return (
    <div className="globe-frame">
      <canvas
        ref={canvasRef}
        className="globe-canvas"
        data-selected-code={selectedCode || ''}
        tabIndex={0}
        aria-label={labels.globeLabel}
        onWheel={event => {
          event.preventDefault();
          adjustZoom(event.deltaY > 0 ? -0.06 : 0.06);
        }}
        onKeyDown={event => {
          if (event.key === 'ArrowLeft') adjustRotation(-8, 0);
          else if (event.key === 'ArrowRight') adjustRotation(8, 0);
          else if (event.key === 'ArrowUp') adjustRotation(0, 6);
          else if (event.key === 'ArrowDown') adjustRotation(0, -6);
          else if (event.key === '+' || event.key === '=') adjustZoom(0.08);
          else if (event.key === '-') adjustZoom(-0.08);
          else if (event.key === '0') reset();
          else return;
          event.preventDefault();
        }}
      >
        {labels.globeLabel}
      </canvas>
      <div className="globe-controls" aria-label={labels.controls}>
        <button type="button" aria-label={labels.rotateLeft} onClick={() => adjustRotation(-10, 0)}><ArrowLeft size={17} /></button>
        <button type="button" aria-label={labels.rotateUp} onClick={() => adjustRotation(0, 8)}><ArrowUp size={17} /></button>
        <button type="button" aria-label={labels.rotateDown} onClick={() => adjustRotation(0, -8)}><ArrowDown size={17} /></button>
        <button type="button" aria-label={labels.rotateRight} onClick={() => adjustRotation(10, 0)}><ArrowRight size={17} /></button>
        <span className="control-divider" />
        <button type="button" aria-label={labels.zoomOut} onClick={() => adjustZoom(-0.1)}><ZoomOut size={17} /></button>
        <button type="button" aria-label={labels.zoomIn} onClick={() => adjustZoom(0.1)}><ZoomIn size={17} /></button>
        <button type="button" aria-label={labels.resetGlobe} onClick={reset}><RotateCcw size={16} /></button>
      </div>
      <div className="globe-hint"><Compass size={15} /> {labels.globeHint}</div>
      {hovered && <div className="hover-label">{hovered}</div>}
      {mapError && <div className="map-warning">{labels.mapUnavailable}</div>}
    </div>
  );
}
