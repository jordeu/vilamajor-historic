# Can Gol, Can Derrocada i Can Llinars

Recerca i implementació: 12 d’octubre de 2026. Models exteriors originals; no s’incorporen fotografies de tercers com a textures. Tots tres s’identifiquen com a **restitucions aproximades**.

## Fonts contrastades

- [Can Gol · Pobles de Catalunya](https://www.poblesdecatalunya.cat/element.php?e=18639): façana, traceries i fotografies d’Albert Esteves (2023), especialment 130950 i 130959.
- [Can Derrocada · Diputació](https://patrimonicultural.diba.cat/element/can-derrocada), fitxa 08234-28: cronologia i descripció arquitectònica.
- [Can Derrocada · Pobles de Catalunya](https://www.poblesdecatalunya.cat/element.php?e=18663): fotos actuals 131173–131174 i fotografies de Gallardo / AFCEC datades 1912–1936, especialment 131183, 131181 i 131178. Permeten llegir la façana abans de les instal·lacions industrials.
- [Can Llinars · Diputació](https://patrimonicultural.diba.cat/element/can-llinars), fitxa 08234-40: casal, galeria i ús lleter.
- [Can Llinars · Pobles de Catalunya](https://www.poblesdecatalunya.cat/element.php?e=18668): fotografia de Gallardo / AFCEC de 1924 (131235) i fotografies actuals 131228–131229.
- [ICGC · Ortofoto territorial](https://geoserveis.icgc.cat/servei/catalunya/orto-territorial/wms): contrast visual amb la capa `ortofoto_25cm_color_2025`, CRS EPSG:25831. Retalls de recerca: Gol `[449012,4612942,449070,4613000]`; Derrocada `[449320,4614870,449390,4614940]`; Llinars `[448940,4615760,449010,4615830]`. Aquests retalls no s’afegeixen a les capes del producte.
- [DGC INSPIRE](https://www.catastro.hacienda.gob.es/webinspire/index.html): les empremtes de `public/data/buildings.json`, ja disponibles al projecte.

## Encaix i fases

| Model | Parts substituïdes | Etapes visibles | Elements recognoscibles |
|---|---|---|---|
| Can Gol de la Torre | `002010700DG41D`, parts 1, 4, 5, 2, 3 | 1600: cos principal interpretat; 2023: annexos documentats en fotografia | Vessant llarg asimètric, portal adovellat, dues finestres amb traceria, cantoneres de la torre incorporada |
| Can Derrocada | `9452004DG4195S`, parts 7, 2, 3, 4, 5 | 1700: casal del XVII interpretat; 1936: ales fotografiades entre 1912 i 1936 | Coberta a quatre vessants, xemeneia octogonal, balcó sobre el portal, galeria oberta |
| Can Llinars / Can Sagarra | `08234A00600152`, parts 4, 2, 6, 3 | 1700: casal interpretat; 1885: ambientació lletera; 2016: galeria i terrasses documentades | Façana simètrica, dovelles, rellotge de sol, cantoneres, petit cos defensiu i galeria |

Els llindars **1600 i 1700 no són dates exactes d’obra**. L’aspecte dels cossos antics extrapola les fotografies i la planta conservada. Els llindars 1936, 2016 i 2023 indiquen evidència disponible, no construcció ni reforma en aquells anys. No es dedueix la forma medieval dels masos de les primeres mencions documentals.

Can Llinars requeria una correcció d’identificació: `001520900DG41F`, la referència suggerida per la fitxa patrimonial, correspon a un petit annex separat dins les dades importades. El casal és la part 4 de `08234A00600152`. Es conserva aquell annex genèric i també els coberts no modelats. La fotografia aèria i les fotos de façana corroboren les quatre vessants descrites per DIBA, davant les dues vessants esmentades a Pobles de Catalunya.

No s’ha fixat prou bé la planta de la capella ni del portal del barri de Can Derrocada: no s’inventen aquests volums. Tampoc es representa l’òcul interior com si fos una obertura exterior. Els edificis industrials i annexos no substituïts continuen seguint la cronologia cadastral general, amb les limitacions d’aquesta font.

## Geometria i ambientació

`tools/build-farmstead-data.mjs` deriva els vèrtexs locals del Cadastre. Origen al centre de la façana principal; +Z local mira cap a l’entrada. `src/farmsteads.ts` construeix els alçats interpretats; `src/heritage.ts` aplica orientació i terreny. Es retiren només les catorze parts modelades, mai tota la finca. La conversió numèrica dels vèrtexs conserva les coordenades amb un error inferior a 2 mm; això **no implica precisió arquitectònica mil·limètrica**.

Alçades, materials, escultura, obertures laterals i petits detalls són aproximats. La coberta principal de Can Gol té un perfil asimètric continu. Les galeries deixen espai obert sota les cobertes i terrasses. Les eres mostregen el relleu local i es difuminen al perímetre. Carros i lleteres són decoració original inventada; no se’n documenten posicions històriques. No es restitueixen les feixes ni tota la finca agrícola.

Cada mas incorpora fonts, límits d’evidència i botons d’etapa a Patrimoni. El documental dedica dotze segons a cadascun: Can Gol el 1600, Can Derrocada el 1700 i Can Llinars el 1885. Total: 31 capítols, 7 minuts. Es mantenen els vuit sobrevols moderns i el final de 2026 amb transició a l’ortofoto actual.

## Verificació

- `npm test`: vèrtexs, substitució parcial del Cadastre, cronologia, límits d’alçada, fusió de geometries i eres ajustades al relleu.
- `npm run build`: TypeScript i producció.
- `tools/farmstead-browser-check.mjs`: tres visites, set botons d’etapa, fonts, tres capítols documentals, mòbil i escriptori, consola sense errors.
- `tools/documentary-finale-browser-check.mjs`: regressió de la transició final a fotografia.

Pendent d’una futura millora: alçats mesurats, fotografies de totes les cares i datació individual d’annexos. La restitució actual permet reconèixer els conjunts, però no és un aixecament patrimonial.

## Entorns rurals i aproximacions de càmera

Ampliació del 12 d’octubre de 2026:

- Can Gol és el conjunt pilot: era i accés corbat, arbres que emmarquen la façana, dos horts, fruiters, murs discontinus, botes i carro. La fotografia frontal de 2023 orienta el petit abeurador de l’etapa actual. L’ortofoto de 2025 orienta l’accés i l’arbrat lateral, sense atribuir precisió d’aixecament a aquests detalls.
- Can Derrocada concentra l’ambientació al pati lliure. Es deixen fora dels horts, arbres i murs les empremtes dels annexos, incloses les no modelades específicament.
- Can Llinars afegeix arbrat lateral, horts, accés i espai de treball. Les lleteres apareixen amb l’etapa de 1885 i desapareixen del paisatge modern.

La disposició d’horts, fruiters i murs, el creixement de les capçades i la retirada de l’ambientació agrícola són **inventats**. El canvi de tractament rural a contemporani el 1956 (Gol/Llinars) o 1936 (Derrocada) és narratiu: no documenta dates d’abandonament agrícola ni el final de la indústria làctia. Els arbres no són exemplars identificats. Els terrenys es mostregen al relleu actual; no es crea una plataforma plana artificial.

`src/farmstead-setting-data.ts` fixa els àmbits i la reserva d’arbres per evitar duplicar les capçades regionals. `src/farmstead-setting.ts` separa entorn comú, agrícola, contemporani i lleter; canviar l’any enrere restitueix l’etapa anterior. El control de vegetació també actua sobre els arbres dels masos. Es fusiona la geometria estàtica per material; no s’afegeixen bucles d’animació dels ornaments.

`src/farmstead-materials.ts` aporta materials procedimentals originals de teula, calç, pedra i fusta, amb detall a escala mètrica i desgast discret. No introdueix textures fotogràfiques de tercers ni altera els materials de les altres cases.

Els tres capítols del documental tenen una aproximació definida per temps: vista general inicial, acostament amb acceleració i frenada suaus, i aturada final davant la façana. Can Gol comença centrat també sobre els horts. La trajectòria es reprodueix igual en moure la barra, pausar o reprendre; el mode de moviment reduït manté una vista estable. Durada total conservada: set minuts.

Validacions afegides: jardins, troncs i murs fora d’edificis/camins; arrelament de capçades sobre pendent; canvis d’època reversibles; trajectòria determinista i moviment reduït. `tools/farmstead-camera-browser-check.mjs` comprova el pas de general a detall, pausa i salts temporals en Chromium. La revisió visual es fa en mòbil emulat i escriptori; no és una mesura de rendiment sobre un telèfon físic.
