# Procedència del codi i dels recursos

Revisió tècnica del 12 d’octubre de 2026. Aquest inventari descriu les fonts
verificables de la versió actual; no certifica l’autoria de cada línia ni
substitueix una revisió jurídica.

## Implementació

| Àmbit | Fitxers i procedència verificable |
| --- | --- |
| Visor i navegació | `src/scene.ts`, `src/geo.ts`, `src/navigation.ts`, `src/camera-motion.ts`: malles georeferenciades i controls basats en l’API de Three.js. |
| Interfície | `src/interface.ts`, `src/main.ts`, `src/panels.ts`, `src/style.css`, `src/icons.ts`: components DOM, CSS i formes SVG locals; decisions visuals documentades a `DESIGN.md`. DM Sans es carrega des de Google Fonts. |
| Cronologia i documental | `src/history.ts`, `src/tour.ts`, `src/documentary.ts`, `src/viewer-fullscreen.ts`: fites de Vilamajor amb fonts històriques, recorreguts locals i API de pantalla completa del navegador. |
| Patrimoni | `src/heritage.ts`, `src/bertran.ts`, `src/residential.ts`, `src/farmsteads.ts` i mòduls associats: geometria procedimental. Les fitxes de `public/data/heritage.json` i els documents de recerca identifiquen fonts, mesures, datacions i interpretacions. |
| Materials i ambientació | `src/building-material.ts`, `src/farmstead-materials.ts`, `src/landscape.ts`, `src/period-context.ts`: formes i materials generats per codi. La decoració antiga és interpretativa, no un aixecament històric. |
| Preparació de dades | `scripts/` i `tools/build-*.mjs`: descàrrega de geoserveis, classificació de vegetació, transformació de plantes cadastrals i triangulació. |
| Comprovacions | `tools/*.test.ts` i `tools/*browser-check.mjs`: proves amb Node i Playwright. |

## Cartografia i dades

- `public/data/provenance.json` registra 105 respostes originals: 101 de
  `geoserveis.icgc.cat` i quatre de `www.catastro.hacienda.gob.es`.
  En aquesta revisió, la mida i el SHA-256 de les 105 respostes s’han contrastat
  amb la memòria cau local de descàrrega, sense discrepàncies.
- `scripts/fetch_geodata.py` descriu la conversió de les elevacions i fotografies
  ICGC i de les dades DGC INSPIRE. `scripts/fetch_microphotos.py` documenta els
  retalls addicionals. Les respostes originals no es distribueixen amb Git.
- `scripts/build_vegetation.py` deriva les mostres d’arbres de l’ortofoto ICGC
  de 2025. Les alçades i les capçades són aproximacions.
- `tools/build-geometry.mjs` deriva les malles comprimides dels edificis a partir
  de les empremtes cadastrals. `tools/build-farmstead-data.mjs` prepara les
  plantes dels tres masos a partir de les mateixes dades.
- `public/data/checksums.json` registra la integritat dels fitxers distribuïts.
  Comprovar aquests hashes detecta canvis; per si sol no demostra la procedència.
- Les captures de `.impeccable/review/` documenten revisions del visor.

Cal conservar les atribucions de l’ICGC, del Cadastre i de les fonts històriques,
tant a les dades com al panell «Fonts i dades». Les condicions dels proveïdors
són independents de les del codi de l’aplicació.

## Dependències

El fitxer `package-lock.json` resol els paquets des de `registry.npmjs.org`.
No hi ha una dependència Git d’una altra aplicació.

| Dependència directa | Versió resolta | Llicència declarada al lockfile |
| --- | --- | --- |
| Three.js | 0.180.0 | MIT |
| Tipus de Three.js | 0.180.0 | MIT |
| TypeScript | 5.9.3 | Apache-2.0 |
| Vite | 7.3.7 | MIT |
| Playwright Test | 1.64.0 | Apache-2.0 |

Les dependències transitives conserven les seves llicències. Les eines Python
es declaren a `scripts/requirements.txt`. El codi propi i la documentació original
del projecte es distribueixen amb la [llicència MIT](../LICENSE), copyright
© 2026 Jordi Deu-Pons. Els materials de tercers i els seus derivats conserven
les condicions descrites a [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).
