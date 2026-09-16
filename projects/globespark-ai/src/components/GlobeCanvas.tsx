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
  Locale,
  MultiPolygonCoordinates,
  PolygonCoordinates,
  Position,
  SelectedCountry,
} from '../types';

const GEO_URL = 'https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson';
const DEG = Math.PI / 180;
const CENTER_CACHE = new WeakMap<object, { lon: number; lat: number }>();

type BundledTopology = { objects?: { countries?: unknown } };
type BundledFeature = GeoFeature & { id?: string | number };
type BundledFeatureCollection = { features?: BundledFeature[] };
type FocusPoint = { longitude: number; latitude: number } | null;
type ProjectedPoint = { x: number; y: number; z: number };
type PointerState = {
  down: boolean;
  moved: boolean;
  x: number;
  y: number;
  lastTime: number;
  primaryId: number | null;
};

type Props = {
  selectedCode?: string;
  focus: FocusPoint;
  locale: Locale;
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function longitudeDelta(target: number, current: number) {
  return ((((target - current) + 540) % 360) + 360) % 360 - 180;
}

function safeName(feature: GeoFeature) {
  const raw = feature.properties?.ADMIN ?? feature.properties?.NAME ?? feature.properties?.name;
  return typeof raw === 'string' ? raw : '';
}

function safeCode(feature: GeoFeature) {
  const raw = feature.properties?.ISO_A2 ?? feature.properties?.iso_a2;
  return typeof raw === 'string' && /^[A-Z]{2}$/.test(raw) ? raw : undefined;
}

function featureKey(feature: GeoFeature) {
  return safeCode(feature) || safeName(feature);
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

function representativePoint(feature: GeoFeature) {
  const cached = CENTER_CACHE.get(feature as object);
  if (cached) return cached;
  let x = 0;
  let y = 0;
  let z = 0;
  let count = 0;
  for (const polygon of polygonSets(feature)) {
    const ring = polygon[0];
    if (!ring?.length) continue;
    const stride = Math.max(1, Math.floor(ring.length / 180));
    for (let index = 0; index < ring.length; index += stride) {
      const [lon, lat] = ring[index];
      const lambda = lon * DEG;
      const phi = lat * DEG;
      const cosPhi = Math.cos(phi);
      x += cosPhi * Math.cos(lambda);
      y += cosPhi * Math.sin(lambda);
      z += Math.sin(phi);
      count += 1;
    }
  }
  const center = count
    ? {
        lon: Math.atan2(y, x) / DEG,
        lat: Math.atan2(z, Math.sqrt(x * x + y * y)) / DEG,
      }
    : { lon: 0, lat: 0 };
  CENTER_CACHE.set(feature as object, center);
  return center;
}

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

export default function GlobeCanvas({ selectedCode, focus, locale, onSelect, labels }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef(-18);
  const tiltRef = useRef(12);
  const zoomRef = useRef(1);
  const zoomTargetRef = useRef(1);
  const focusTargetRef = useRef<FocusPoint>(null);
  const velocityRef = useRef({ lon: 0, lat: 0 });
  const resumeAutoAtRef = useRef(0);
  const hoveredKeyRef = useRef('');
  const onSelectRef = useRef(onSelect);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchDistanceRef = useRef<number | null>(null);
  const pointerRef = useRef<PointerState>({
    down: false,
    moved: false,
    x: 0,
    y: 0,
    lastTime: 0,
    primaryId: null,
  });
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
        setMapError(false);
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
    focusTargetRef.current = focus;
    velocityRef.current = { lon: 0, lat: 0 };
    zoomTargetRef.current = Math.max(zoomTargetRef.current, 1.08);
    resumeAutoAtRef.current = performance.now() + 2200;
  }, [focus]);

  function pauseAutoRotation(duration = 1600) {
    resumeAutoAtRef.current = performance.now() + duration;
  }

  function adjustRotation(lonDelta: number, latDelta: number) {
    focusTargetRef.current = null;
    velocityRef.current = { lon: 0, lat: 0 };
    rotationRef.current += lonDelta;
    tiltRef.current = clamp(tiltRef.current + latDelta, -58, 58);
    pauseAutoRotation();
  }

  function adjustZoom(delta: number) {
    zoomTargetRef.current = clamp(zoomTargetRef.current + delta, 0.72, 1.75);
    pauseAutoRotation();
  }

  function reset() {
    focusTargetRef.current = null;
    velocityRef.current = { lon: 0, lat: 0 };
    rotationRef.current = -18;
    tiltRef.current = 12;
    zoomRef.current = 1;
    zoomTargetRef.current = 1;
    pauseAutoRotation();
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
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const displayNames = new Intl.DisplayNames([locale], { type: 'region' });

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

    function drawCountries(now: number) {
      for (const feature of geoData) {
        const key = featureKey(feature);
        const active = Boolean(selectedCode && selectedCode === safeCode(feature));
        const hoveredFeature = !active && hoveredKeyRef.current === key;
        context.save();
        context.strokeStyle = active
          ? 'rgba(103, 232, 249, .99)'
          : hoveredFeature
            ? 'rgba(147, 233, 253, .92)'
            : 'rgba(147, 197, 253, .52)';
        context.fillStyle = active
          ? 'rgba(34, 211, 238, .34)'
          : hoveredFeature
            ? 'rgba(59, 130, 246, .25)'
            : 'rgba(37, 99, 235, .14)';
        context.lineWidth = active ? 2.1 : hoveredFeature ? 1.25 : 0.72;
        if (active || hoveredFeature) {
          context.shadowColor = active ? 'rgba(103, 232, 249, .72)' : 'rgba(125, 211, 252, .35)';
          context.shadowBlur = active ? 16 : 8;
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

      if (!selectedCode) return;
      const selectedFeature = geoData.find(feature => safeCode(feature) === selectedCode);
      if (!selectedFeature) return;
      const center = representativePoint(selectedFeature);
      const point = project(center.lon, center.lat);
      if (point.z <= 0.05) return;
      const pulse = reducedMotion ? 0.35 : (Math.sin(now / 260) + 1) / 2;
      context.save();
      context.beginPath();
      context.arc(point.x, point.y, 8 + pulse * 5, 0, Math.PI * 2);
      context.strokeStyle = `rgba(103, 232, 249, ${0.5 - pulse * 0.18})`;
      context.lineWidth = 2;
      context.stroke();
      context.beginPath();
      context.arc(point.x, point.y, 4.2, 0, Math.PI * 2);
      context.fillStyle = '#a5f3fc';
      context.shadowColor = 'rgba(103, 232, 249, .95)';
      context.shadowBlur = 14;
      context.fill();
      context.restore();
    }

    function updateMotion(elapsed: number, now: number) {
      const zoomEase = 1 - Math.exp(-elapsed / 95);
      zoomRef.current += (zoomTargetRef.current - zoomRef.current) * zoomEase;

      const target = focusTargetRef.current;
      if (target) {
        const lonDiff = longitudeDelta(target.longitude, rotationRef.current);
        const targetTilt = clamp(target.latitude, -58, 58);
        const latDiff = targetTilt - tiltRef.current;
        const ease = 1 - Math.exp(-elapsed / 175);
        rotationRef.current += lonDiff * ease;
        tiltRef.current += latDiff * ease;
        velocityRef.current = { lon: 0, lat: 0 };
        if (Math.abs(lonDiff) < 0.08 && Math.abs(latDiff) < 0.08) {
          rotationRef.current += lonDiff;
          tiltRef.current = targetTilt;
          focusTargetRef.current = null;
        }
        return;
      }

      if (pointerRef.current.down) return;
      const velocity = velocityRef.current;
      const moving = Math.abs(velocity.lon) > 0.002 || Math.abs(velocity.lat) > 0.002;
      if (moving) {
        rotationRef.current += velocity.lon * elapsed;
        const nextTilt = clamp(tiltRef.current + velocity.lat * elapsed, -58, 58);
        if (nextTilt === -58 || nextTilt === 58) velocity.lat = 0;
        tiltRef.current = nextTilt;
        const damping = Math.pow(0.91, elapsed / 16.67);
        velocity.lon *= damping;
        velocity.lat *= damping;
        return;
      }
      velocityRef.current = { lon: 0, lat: 0 };
      if (!reducedMotion && now > resumeAutoAtRef.current) {
        rotationRef.current = (rotationRef.current + elapsed * 0.0022) % 360;
      }
    }

    function draw(now: number) {
      const elapsed = Math.min(50, now - lastTime);
      lastTime = now;
      updateMotion(elapsed, now);
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
      drawCountries(now);
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
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const point = inverseProject(localX, localY);
      if (!point) return null;
      for (let index = geoData.length - 1; index >= 0; index -= 1) {
        if (featureContains(geoData[index], point.lon, point.lat)) return geoData[index];
      }

      const tolerance = (coarsePointer ? 32 : 22) / Math.sqrt(Math.max(0.8, zoomRef.current));
      let nearest: GeoFeature | null = null;
      let nearestDistance = tolerance;
      for (const feature of geoData) {
        const center = representativePoint(feature);
        const projected = project(center.lon, center.lat);
        if (projected.z <= 0.08) continue;
        const distance = Math.hypot(projected.x - localX, projected.y - localY);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = feature;
        }
      }
      return nearest;
    }

    function localName(feature: GeoFeature) {
      const code = safeCode(feature);
      return code ? displayNames.of(code) || safeName(feature) : safeName(feature);
    }

    function pointerDistance() {
      const points = Array.from(pointersRef.current.values());
      if (points.length < 2) return null;
      return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
    }

    function onPointerDown(event: PointerEvent) {
      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      canvas.setPointerCapture(event.pointerId);
      pauseAutoRotation(2200);
      focusTargetRef.current = null;
      if (pointersRef.current.size >= 2) {
        pointerRef.current.moved = true;
        pinchDistanceRef.current = pointerDistance();
        velocityRef.current = { lon: 0, lat: 0 };
        return;
      }
      pointerRef.current = {
        down: true,
        moved: false,
        x: event.clientX,
        y: event.clientY,
        lastTime: event.timeStamp,
        primaryId: event.pointerId,
      };
      velocityRef.current = { lon: 0, lat: 0 };
      canvas.style.cursor = 'grabbing';
    }

    function onPointerMove(event: PointerEvent) {
      if (pointersRef.current.has(event.pointerId)) {
        pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      }
      if (pointersRef.current.size >= 2) {
        const distance = pointerDistance();
        const previous = pinchDistanceRef.current;
        if (distance != null && previous != null) {
          const delta = (distance - previous) * 0.0028;
          zoomTargetRef.current = clamp(zoomTargetRef.current + delta, 0.72, 1.75);
        }
        pinchDistanceRef.current = distance;
        pointerRef.current.moved = true;
        pauseAutoRotation(2200);
        return;
      }

      const drag = pointerRef.current;
      if (drag.down && drag.primaryId === event.pointerId) {
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        const dt = Math.max(8, event.timeStamp - drag.lastTime);
        if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
        const speedScale = 1 / Math.sqrt(Math.max(0.8, zoomRef.current));
        const lonMove = -dx * 0.32 * speedScale;
        const latMove = dy * 0.2 * speedScale;
        rotationRef.current += lonMove;
        tiltRef.current = clamp(tiltRef.current + latMove, -58, 58);
        velocityRef.current.lon = velocityRef.current.lon * 0.55 + (lonMove / dt) * 0.45;
        velocityRef.current.lat = velocityRef.current.lat * 0.55 + (latMove / dt) * 0.45;
        drag.x = event.clientX;
        drag.y = event.clientY;
        drag.lastTime = event.timeStamp;
        pauseAutoRotation(2200);
        return;
      }

      const feature = countryAt(event.clientX, event.clientY);
      const nextHover = feature ? localName(feature) : '';
      const nextKey = feature ? featureKey(feature) : '';
      hoveredKeyRef.current = nextKey;
      canvas.style.cursor = feature ? 'pointer' : 'grab';
      pauseAutoRotation(900);
      if (nextHover !== hovering) {
        hovering = nextHover;
        setHovered(nextHover);
      }
    }

    function finishPointer(event: PointerEvent, allowSelection: boolean) {
      const wasMoved = pointerRef.current.moved || pointersRef.current.size > 1;
      pointersRef.current.delete(event.pointerId);
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      pinchDistanceRef.current = pointersRef.current.size >= 2 ? pointerDistance() : null;

      if (pointersRef.current.size === 0) {
        pointerRef.current.down = false;
        pointerRef.current.primaryId = null;
        canvas.style.cursor = 'grab';
        pauseAutoRotation(1800);
        if (allowSelection && !wasMoved) {
          const feature = countryAt(event.clientX, event.clientY);
          const name = feature ? localName(feature) : '';
          if (feature && name) onSelectRef.current({ name, code: safeCode(feature) });
        }
        return;
      }

      const remainingId = Array.from(pointersRef.current.keys())[0];
      const remaining = remainingId == null ? null : pointersRef.current.get(remainingId);
      if (!remaining) {
        pointerRef.current.down = false;
        pointerRef.current.primaryId = null;
        return;
      }
      pointerRef.current = {
        down: true,
        moved: true,
        x: remaining.x,
        y: remaining.y,
        lastTime: event.timeStamp,
        primaryId: remainingId,
      };
    }

    function onPointerUp(event: PointerEvent) {
      finishPointer(event, true);
    }

    function onPointerCancel(event: PointerEvent) {
      finishPointer(event, false);
    }

    function onPointerLeave() {
      if (pointerRef.current.down) return;
      hoveredKeyRef.current = '';
      hovering = '';
      setHovered('');
      canvas.style.cursor = 'grab';
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerCancel);
    canvas.addEventListener('pointerleave', onPointerLeave);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
      canvas.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [geoData, selectedCode, locale]);

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
          adjustZoom(event.deltaY > 0 ? -0.07 : 0.07);
        }}
        onDoubleClick={() => adjustZoom(0.16)}
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
