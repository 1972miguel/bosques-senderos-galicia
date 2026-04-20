/**
 * Lógica de mapas abstracción
 * @file src/utils/map.ts
 *
 * Centraliza toda la lógica de Leaflet para reutilización
 * y testabilidad
 */

import type { RouteMapConfig, GPXData, WaypointData } from "../types";

declare global {
  interface Window {
    L: any;
  }
}

// ============================================================================
// TIPOS
// ============================================================================

export interface MapInitOptions {
  zoom?: number;
  center?: [lat: number, lng: number];
  zoomControl?: boolean;
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Inicializa un mapa Leaflet en un contenedor
 * @param containerId - ID del elemento DOM
 * @param lat - Latitud inicial
 * @param lng - Longitud inicial
 * @param options - Opciones de configuración
 */
export function initializeMap(
  containerId: string,
  lat: number,
  lng: number,
  options: MapInitOptions = {},
): any | null {
  if (typeof window === "undefined") return null;

  const L = window.L;
  if (!L) {
    console.error(
      "Leaflet not loaded. Make sure to include leaflet.css and leaflet.js",
    );
    return null;
  }

  try {
    const { zoom = 14, center = [lat, lng], zoomControl = true } = options;

    const map = L.map(containerId, {
      zoomControl: false,
      attributionControl: true,
    }).setView(center, zoom);

    addBaseTileLayer(map);

    if (zoomControl) {
      L.control.zoom({ position: "bottomright" }).addTo(map);
    }

    return map;
  } catch (err) {
    console.error(`Failed to initialize map ${containerId}:`, err);
    return null;
  }
}

/**
 * Agrega capa base de tiles de OpenStreetMap
 */
function addBaseTileLayer(map: any): void {
  const L = window.L;
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 18,
  }).addTo(map);
}

// ============================================================================
// RUTAS/TRACKS
// ============================================================================

/**
 * Agrega una ruta GPX al mapa
 * @param map - Instancia de Leaflet Map
 * @param gpxFile - Archivo GPX en formato JSON
 */
export async function addTrackToMap(map: any, gpxFile: string): Promise<void> {
  if (!gpxFile) return;

  try {
    const response = await fetch(`/data/rutas/${gpxFile}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${gpxFile}: ${response.statusText}`);
    }

    const data: GPXData = await response.json();

    if (data.track && data.track.length > 0) {
      addTrackPolyline(map, data.track);
    }

    if (data.waypoints && data.waypoints.length > 0) {
      data.waypoints.forEach((wp) => addWaypointMarker(map, wp));
    }
  } catch (err) {
    console.error(`Error loading track ${gpxFile}:`, err);
    // No lanzar error, permitir que el mapa funcione sin la ruta
  }
}

/**
 * Dibuja una polilínea con los puntos del track
 */
function addTrackPolyline(
  map: any,
  track: Array<[lat: number, lng: number, ele?: number]>,
): void {
  const L = window.L;
  const trackCoords = track.map((p) => [p[0], p[1]]);

  const polyline = L.polyline(trackCoords, {
    color: "#4caf50",
    weight: 3,
    opacity: 0.9,
  }).addTo(map);

  // Auto-zoom para mostrar toda la ruta
  map.fitBounds(polyline.getBounds(), {
    padding: [20, 20],
    maxZoom: 15,
  });
}

// ============================================================================
// WAYPOINTS/MARCADORES
// ============================================================================

/**
 * Agrega un marcador de waypoint al mapa
 */
function addWaypointMarker(map: any, waypoint: WaypointData): void {
  const L = window.L;

  const icon = createWaypointIcon(waypoint.num);
  const popup = createWaypointPopup(waypoint);

  L.marker([waypoint.lat, waypoint.lng], { icon })
    .addTo(map)
    .bindPopup(popup, { maxWidth: 220 });
}

/**
 * Crea un icono personalizado para waypoints
 */
function createWaypointIcon(number: number): any {
  const L = window.L;

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: #1a2e1a;
        border: 2px solid #4caf50;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 600;
        color: #4caf50;
        font-family: system-ui, sans-serif;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      ">
        ${number}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

/**
 * Crea el contenido HTML del popup de waypoint
 */
function createWaypointPopup(waypoint: WaypointData): string {
  return `
    <div style="font-family: system-ui, sans-serif; min-width: 180px;">
      <div style="
        font-weight: 600;
        font-size: 13px;
        margin-bottom: 4px;
        color: #1a2e1a;
      ">
        ${waypoint.num}. ${waypoint.nome}
      </div>
      <div style="
        font-size: 11px;
        color: #555;
        margin-bottom: 4px;
      ">
        ${waypoint.km} km
      </div>
      <div style="
        font-size: 12px;
        color: #333;
        line-height: 1.4;
      ">
        ${waypoint.nota}
      </div>
    </div>
  `;
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Calcula los bounds de un conjunto de coordenadas
 */
export function calculateBounds(
  coords: Array<[lat: number, lng: number]>,
): [[number, number], [number, number]] | null {
  if (coords.length === 0) return null;

  let minLat = coords[0][0],
    maxLat = coords[0][0];
  let minLng = coords[0][1],
    maxLng = coords[0][1];

  for (const [lat, lng] of coords) {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  }

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}

/**
 * Calcula la distancia entre dos puntos (aproximado)
 * Fórmula de Haversine
 */
export function calculateDistance(
  [lat1, lng1]: [number, number],
  [lat2, lng2]: [number, number],
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Valida que una coordenada sea válida
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
