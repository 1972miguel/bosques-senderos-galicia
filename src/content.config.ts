import { defineCollection, z, reference } from "astro:content";
import { glob } from "astro/loaders";

const ecosistemas = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/ecosistemas" }),
  schema: z.object({
    nome: z.string(),
    subtitulo: z.string(),
    zona: z.string(),
    cor: z.string().default("#1a3d1a"),
    resumo: z.string(),
    imaxe: z.string().optional(),
  }),
});

const especies = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/especies" }),
  schema: z.object({
    nomeComun: z.string(),
    nomeCientifico: z.string(),
    familia: z.string(),
    tipo: z.enum(["flora", "fauna", "fungo", "liquen"]),
    conservacion: z.enum(["LC", "NT", "VU", "EN", "CR"]).optional(),
    ecosistemas: z.array(reference("ecosistemas")).optional(),
    imaxe: z.string().optional(),
  }),
});

const rutas = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/rutas" }),
  schema: z.object({
    titulo: z.string(),
    subtitulo: z.string().optional(),
    provincia: z.enum(["A Coruña", "Lugo", "Ourense", "Pontevedra"]),
    dificultade: z.enum(["fácil", "moderada", "difícil"]),
    tipo: z.enum(["circular", "lineal", "semircircular"]),
    distancia: z.number(),
    desnivel: z.number(),
    duracion: z.string(),
    ecosistema: reference("ecosistemas"),
    coordenadasInicio: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    gpxFile: z.string().optional(),
    imaxe: z.string().optional(),
    publicada: z.boolean().default(true),
  }),
});

export const collections = { ecosistemas, especies, rutas };
