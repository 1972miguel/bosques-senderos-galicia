import { readFileSync, writeFileSync } from "fs";

const xml = readFileSync("public/data/rutas/fragas-do-eume.gpx", "utf8");
const coords = [];
const regex =
  /trkpt lat="([^"]+)" lon="([^"]+)"[^>]*>[\s\S]*?<ele>([^<]+)<\/ele>/g;
let m;

while ((m = regex.exec(xml)) !== null) {
  coords.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
}

const existing = JSON.parse(
  readFileSync("public/data/rutas/fragas-do-eume.json", "utf8"),
);
existing.track = coords;
writeFileSync(
  "public/data/rutas/fragas-do-eume.json",
  JSON.stringify(existing),
);
console.log("Track points extraídos:", coords.length);
