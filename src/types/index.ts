/**
 * Tipos compartidos para todo el proyecto
 * @file src/types/index.ts
 *
 * Centraliza tipos para evitar duplicación y mejorar type safety
 */

import type { CollectionEntry } from "astro:content";

// ============================================================================
// TIPOS DE DATOS DEL DOMINIO
// ============================================================================

export type DificultadeRoute = "fácil" | "moderada" | "difícil";
export type TipoRoute = "circular" | "lineal" | "semircircular";
export type Provincia = "A Coruña" | "Lugo" | "Ourense" | "Pontevedra";
export type EspecieType = "flora" | "fauna" | "fungo" | "liquen";
export type ConservationStatus = "LC" | "NT" | "VU" | "EN" | "CR";

export interface Coordenadas {
  lat: number;
  lng: number;
  ele?: number;
}

// ============================================================================
// COLECCIONES
// ============================================================================

export type RutaEntry = CollectionEntry<"rutas">;
export type EcosistemaEntry = CollectionEntry<"ecosistemas">;
export type EspecieEntry = CollectionEntry<"especies">;

export interface RutaData {
  titulo: string;
  subtitulo?: string;
  provincia: Provincia;
  dificultade: DificultadeRoute;
  tipo: TipoRoute;
  distancia: number;
  desnivel: number;
  duracion: string;
  ecosistema: EcosistemaEntry;
  coordenadasInicio: Coordenadas;
  gpxFile?: string;
  imaxe?: string;
  publicada: boolean;
}

export interface EcosistemaData {
  nome: string;
  subtitulo: string;
  zona: string;
  cor: string;
  resumo: string;
  imaxe?: string;
}

export interface EspecieData {
  nomeComun: string;
  nomeCientifico: string;
  familia: string;
  tipo: EspecieType;
  conservacion?: ConservationStatus;
  ecosistemas?: EcosistemaEntry[];
  imaxe?: string;
}

// ============================================================================
// COMPONENTES
// ============================================================================

export interface CardProps {
  href: string;
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: Array<{
    label: string;
    value: string;
  }>;
  badges?: Array<{
    label: string;
    color: BadgeColor;
  }>;
  hoverEffect?: boolean;
}

export type BadgeColor =
  | "green"
  | "yellow"
  | "red"
  | "blue"
  | "orange"
  | "stone";

export interface BadgeProps {
  label: string;
  color?: BadgeColor;
}

export interface NavigationItem {
  href: string;
  label: string;
  icon: "home" | "routes" | "ecosystems" | "species";
  activeTab?: string;
}

// ============================================================================
// MAPAS
// ============================================================================

export interface RouteMapConfig {
  routeId: string;
  lat: number;
  lng: number;
  zoom?: number;
  gpxFile?: string;
}

export interface WaypointData {
  num: number;
  nome: string;
  lat: number;
  lng: number;
  km: number;
  nota: string;
}

export interface GPXData {
  track: Array<[lat: number, lng: number, ele?: number]>;
  waypoints?: WaypointData[];
}

// ============================================================================
// UI STATE
// ============================================================================

export type ActiveTab = "inicio" | "rutas" | "ecosistemas" | "especies";

export interface NavbarProps {
  titulo: string;
  descripcion?: string;
  activeTab?: ActiveTab;
}

// ============================================================================
// CONSERVATION STATUS MAPPINGS
// ============================================================================

export const CONSERVATION_LABELS: Record<ConservationStatus, string> = {
  LC: "Preocupación menor",
  NT: "Case ameazada",
  VU: "Vulnerable",
  EN: "En perigo",
  CR: "En perigo crítico",
};

export const CONSERVATION_CLASSES: Record<ConservationStatus, string> = {
  LC: "bg-green-950 text-green-400 border-green-900",
  NT: "bg-yellow-950 text-yellow-400 border-yellow-900",
  VU: "bg-orange-950 text-orange-400 border-orange-900",
  EN: "bg-red-950 text-red-400 border-red-900",
  CR: "bg-red-950 text-red-300 border-red-900",
};

export const SPECIES_TYPE_CLASSES: Record<EspecieType, string> = {
  flora: "bg-green-950 text-green-400 border-green-900",
  fauna: "bg-blue-950 text-blue-400 border-blue-900",
  fungo: "bg-orange-950 text-orange-400 border-orange-900",
  liquen: "bg-stone-800 text-stone-400 border-stone-700",
};

// ============================================================================
// LAYOUT PROPS
// ============================================================================

export interface LayoutProps {
  titulo: string;
  descripcion?: string;
  activeTab?: ActiveTab;
}

export interface ContentLayoutProps extends LayoutProps {
  backHref?: string;
  backLabel?: string;
}
