/**
 * Structured Data para Senderos e Bosques de Galicia
 * @file src/utils/structured-data.ts
 *
 * JSON-LD schema para SEO y metadata rico
 */

export interface StructuredDataOptions {
  type: "WebSite" | "BreadcrumbList" | "Event" | "Organization";
  [key: string]: any;
}

/**
 * Genera schema JSON-LD para el sitio
 */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Sendeiros de Galicia",
    description: "Rutas con ficha ecolóxica do ecosistema galego",
    url: "https://senderosegalizia.gal",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://senderosegalizia.gal/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Genera schema para una ruta (Route/Trail)
 */
export function generateRouteSchema(ruta: any) {
  return {
    "@context": "https://schema.org",
    "@type": "EventSeries",
    name: ruta.titulo,
    description: ruta.descricion,
    image: "/images/route-default.jpg",
    startDate: new Date().toISOString(),
    organizer: {
      "@type": "Organization",
      name: "Sendeiros de Galicia",
      url: "https://senderosegalizia.gal",
    },
    location: {
      "@type": "Place",
      name: ruta.provincia,
      address: {
        "@type": "PostalAddress",
        addressRegion: "Galicia",
        addressCountry: "ES",
      },
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: "0",
      description: "Acceso gratuito a la ruta",
    },
  };
}

/**
 * Genera schema para una especie (Species/Organism)
 */
export function generateSpeciesSchema(especie: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Thing",
    name: especie.nomeComun,
    alternateName: especie.nomeCientifico,
    description: especie.descricion,
    image: "/images/species-default.jpg",
    location: {
      "@type": "Place",
      name: "Galicia",
      address: {
        "@type": "PostalAddress",
        addressRegion: "Galicia",
        addressCountry: "ES",
      },
    },
    isPartOf: {
      "@type": "Place",
      name: especie.zona,
    },
    conservationStatus: especie.conservacion,
  };
}

/**
 * Genera schema para un ecosistema
 */
export function generateEcosystemSchema(ecosistema: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: ecosistema.nome,
    description: ecosistema.descricion,
    location: {
      "@type": "PostalAddress",
      addressRegion: "Galicia",
      addressCountry: "ES",
    },
    image: "/images/ecosystem-default.jpg",
    hasPart: {
      "@type": "Collection",
      name: "Species in ecosystem",
    },
  };
}

/**
 * Genera breadcrumb navigation schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Genera Organization schema
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Sendeiros de Galicia",
    url: "https://senderosegalizia.gal",
    logo: "https://senderosegalizia.gal/logo.svg",
    description: "Plataforma de rutas ecolóxicas en Galicia",
    address: {
      "@type": "PostalAddress",
      addressCountry: "ES",
      addressRegion: "Galicia",
    },
    sameAs: [
      "https://twitter.com/senderoseg",
      "https://instagram.com/senderoseg",
    ],
  };
}

/**
 * Helper: Convierte schema a JSON-LD script tag
 */
export function toJsonLdString(schema: any): string {
  return JSON.stringify(schema, null, 2);
}
