/**
 * Funciones de colecciones centralizadas
 * @file src/utils/collections.ts
 *
 * Evita queries duplicadas y proporciona interface consistente
 * para acceder a colecciones durante SSG
 */

import { getCollection, getEntry } from "astro:content";
import type { RutaEntry, EcosistemaEntry, EspecieEntry } from "../types";

// ============================================================================
// CACHE DURANTE SSG
// ============================================================================

let cachedRoutes: RutaEntry[] | null = null;
let cachedPublishedRoutes: RutaEntry[] | null = null;
let cachedEcosistemas: EcosistemaEntry[] | null = null;
let cachedEspecies: EspecieEntry[] | null = null;

/**
 * Obtiene todas las rutas
 * Cached durante SSG build
 */
export async function getAllRoutes(): Promise<RutaEntry[]> {
  if (cachedRoutes) return cachedRoutes;
  cachedRoutes = await getCollection("rutas");
  return cachedRoutes;
}

/**
 * Obtiene solo rutas publicadas
 * Cached durante SSG build
 */
export async function getPublishedRoutes(): Promise<RutaEntry[]> {
  if (cachedPublishedRoutes) return cachedPublishedRoutes;
  const allRoutes = await getAllRoutes();
  cachedPublishedRoutes = allRoutes.filter((r) => r.data.publicada);
  return cachedPublishedRoutes;
}

/**
 * Obtiene todas las ecosistemas
 * Cached durante SSG build
 */
export async function getAllEcosistemas(): Promise<EcosistemaEntry[]> {
  if (cachedEcosistemas) return cachedEcosistemas;
  cachedEcosistemas = await getCollection("ecosistemas");
  return cachedEcosistemas;
}

/**
 * Obtiene ecosistema por ID
 */
export async function getEcosistemaById(
  id: string,
): Promise<EcosistemaEntry | undefined> {
  const all = await getAllEcosistemas();
  return all.find((e) => e.id === id);
}

/**
 * Obtiene todas las especies
 */
export async function getAllEspecies(): Promise<EspecieEntry[]> {
  if (cachedEspecies) return cachedEspecies;
  cachedEspecies = await getCollection("especies");
  return cachedEspecies;
}

/**
 * Obtiene especie por ID
 */
export async function getEspecieById(
  id: string,
): Promise<EspecieEntry | undefined> {
  const all = await getAllEspecies();
  return all.find((e) => e.id === id);
}

// ============================================================================
// QUERIES DERIVADAS
// ============================================================================

/**
 * Obtiene todas las rutas para un ecosistema específico
 * @param ecoId - ID del ecosistema
 */
export async function getRoutesForEcosystem(
  ecoId: string,
): Promise<RutaEntry[]> {
  const routes = await getPublishedRoutes();
  return routes.filter((r) => r.data.ecosistema.id === ecoId);
}

/**
 * Obtiene rutas agrupadas por provincia
 */
export async function getRoutesByProvince(): Promise<
  Record<string, RutaEntry[]>
> {
  const routes = await getPublishedRoutes();
  return routes.reduce(
    (acc, route) => {
      const province = route.data.provincia;
      if (!acc[province]) acc[province] = [];
      acc[province].push(route);
      return acc;
    },
    {} as Record<string, RutaEntry[]>,
  );
}

/**
 * Obtiene rutas agrupadas por dificultad
 */
export async function getRoutesByDifficulty(): Promise<
  Record<string, RutaEntry[]>
> {
  const routes = await getPublishedRoutes();
  return routes.reduce(
    (acc, route) => {
      const difficulty = route.data.dificultade;
      if (!acc[difficulty]) acc[difficulty] = [];
      acc[difficulty].push(route);
      return acc;
    },
    {} as Record<string, RutaEntry[]>,
  );
}

/**
 * Obtiene especies agrupadas por tipo
 */
export async function getSpeciesByType(): Promise<
  Record<string, EspecieEntry[]>
> {
  const species = await getAllEspecies();
  return species.reduce(
    (acc, specie) => {
      const type = specie.data.tipo;
      if (!acc[type]) acc[type] = [];
      acc[type].push(specie);
      return acc;
    },
    {} as Record<string, EspecieEntry[]>,
  );
}

/**
 * Obtiene todas las especies para un ecosistema
 * @param ecoId - ID del ecosistema
 */
export async function getSpeciesForEcosystem(
  ecoId: string,
): Promise<EspecieEntry[]> {
  const all = await getAllEspecies();
  return all.filter((s) => s.data.ecosistemas?.some((ref) => ref.id === ecoId));
}

/**
 * Obtiene los IDs de todas las rutas (para getStaticPaths)
 */
export async function getRouteIds(): Promise<string[]> {
  const routes = await getPublishedRoutes();
  return routes.map((r) => r.id);
}

/**
 * Obtiene los IDs de todos los ecosistemas (para getStaticPaths)
 */
export async function getEcosistemaIds(): Promise<string[]> {
  const ecos = await getAllEcosistemas();
  return ecos.map((e) => e.id);
}

/**
 * Obtiene los IDs de todas las especies (para getStaticPaths)
 */
export async function getSpecieIds(): Promise<string[]> {
  const species = await getAllEspecies();
  return species.map((s) => s.id);
}

// ============================================================================
// UTILITARIOS
// ============================================================================

/**
 * Cuenta rutas por ecosistema
 */
export async function getRouteCountByEcosystem(): Promise<
  Record<string, number>
> {
  const routes = await getPublishedRoutes();
  return routes.reduce(
    (acc, route) => {
      const ecoId = route.data.ecosistema.id;
      acc[ecoId] = (acc[ecoId] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

/**
 * Obtiene estadísticas generales
 */
export async function getStats(): Promise<{
  totalRoutes: number;
  totalEcosistemas: number;
  totalSpecies: number;
  provincias: Set<string>;
}> {
  const routes = await getPublishedRoutes();
  const ecos = await getAllEcosistemas();
  const species = await getAllEspecies();

  const provincias = new Set(routes.map((r) => r.data.provincia));

  return {
    totalRoutes: routes.length,
    totalEcosistemas: ecos.length,
    totalSpecies: species.length,
    provincias,
  };
}

/**
 * Busca rutas por término (búsqueda simple)
 * En producción, usar Algolia o similar
 */
export async function searchRoutes(query: string): Promise<RutaEntry[]> {
  const routes = await getPublishedRoutes();
  const lowerQuery = query.toLowerCase();

  return routes.filter(
    (r) =>
      r.data.titulo.toLowerCase().includes(lowerQuery) ||
      r.data.subtitulo?.toLowerCase().includes(lowerQuery) ||
      r.data.provincia.toLowerCase().includes(lowerQuery),
  );
}

/**
 * Busca especies por término
 */
export async function searchSpecies(query: string): Promise<EspecieEntry[]> {
  const species = await getAllEspecies();
  const lowerQuery = query.toLowerCase();

  return species.filter(
    (s) =>
      s.data.nomeComun.toLowerCase().includes(lowerQuery) ||
      s.data.nomeCientifico.toLowerCase().includes(lowerQuery) ||
      s.data.familia.toLowerCase().includes(lowerQuery),
  );
}
