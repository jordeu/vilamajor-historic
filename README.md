# Vilamajor a través del temps

Cronologia 3D en català sobre Sant Pere i Sant Antoni de Vilamajor, amb **relleu, ortofotos, edificis i parcel·les reals**, models patrimonials i reconstruccions antigues amb fonts i hipòtesis explícites.

La procedència verificable del codi, les dades i les dependències es recull a
[l’inventari de procedència](research/source-provenance.md).

Creat per [Jordi Deu-Pons](https://github.com/jordeu).
El codi propi i la documentació original es distribueixen amb [llicència MIT](LICENSE).
La cartografia, les dades, les imatges i les dependències conserven les seves
[condicions i atribucions](THIRD_PARTY_NOTICES.md).

## Executar

```sh
npm install
npm run dev
npm run build
npm run preview
npm test
```

Desenvolupament: http://localhost:5173. La compilació estàtica queda a `dist/` i inclou les dades; no necessita un servidor de dades, comptes ni credencials. `base: './'` permet servir-la en un subdirectori. Les tipografies es carreguen de Google Fonts, amb alternatives locals si no hi ha connexió.

## Publicar a GitHub Pages

El workflow `.github/workflows/pages.yml` comprova les PR amb `npm test` i una
compilació amb base `/vilamajor-historic/`. En arribar a `main`, també publica
el contingut de `dist/` a GitHub Pages. Les PR no es despleguen.

Per a la primera publicació amb GitHub Free:

1. Fer públic el repositori a **Settings → General → Change repository visibility**.
2. A **Settings → Pages → Build and deployment**, seleccionar **GitHub Actions**.
3. Incorporar el workflow a `main`. Si ja hi és, executar **Actions → Build and
   deploy GitHub Pages → Run workflow** sobre `main`.

L’adreça prevista és `https://jordeu.github.io/vilamajor-historic/`.
No cal regenerar la cartografia per publicar: les dades necessàries ja són al
repositori. El workflow no modifica la visibilitat del repositori.

Per comprovar localment la mateixa base que es publicarà:

```sh
npm run build -- --base=/vilamajor-historic/
npm run preview -- --base=/vilamajor-historic/
```

El visor de prova s’obre a `http://localhost:4173/vilamajor-historic/`.
Amb aquest servidor actiu, `node tools/pages-browser-check.mjs` comprova la
càrrega de dades sota el subdirectori, els crèdits en mòbil i escriptori, els
modes de pantalla completa i els avisos de llicència distribuïts. Requereix
Chromium de Playwright instal·lat (`npx playwright install chromium`).

## Dades incorporades

| Capa | Font | Contingut |
|---|---|---|
| Relleu | ICGC WCS | Mostreig de 20 m en una àrea de 8 × 15,5 km que cobreix completament els dos municipis; base MDT de 15 m |
| Relleu dels nuclis | ICGC WCS | Mostreig de 5 m en una àrea central de 4 × 4 km; base MDT de 5 m |
| Ortofotos | ICGC | Visor amb els vols en color de 2004 i 2025 (1956 i 1986 es conserven com a dades d’arxiu, sense usar-los al paisatge); textures centrals de 4096² píxels, uns 0,98 m/píxel; retalls dels nuclis a 25 cm/píxel (2025) i 50 cm/píxel (vols històrics) |
| Mapa topogràfic | ICGC | Mapa de referència actual en el mateix sistema de coordenades |
| Edificis | DGC INSPIRE, 21/08/2026 | 4.598 edificis i 15.518 parts amb empremtes reals, patis, plantes i dates declarades |
| Parcel·les | DGC INSPIRE, 21/08/2026 | 8.330 parcel·les reals |
| Límits i nuclis | ICGC, dades de 20/01/2026 | Geometries municipals a escala oficial 1:5.000 i posicions oficials dels caps municipals |

Totes les dades estan en **ETRS89 / UTM 31N, EPSG:25831**, en metres. No s’exagera l’escala vertical. La projecció manté l’est cap a la dreta i el nord cap al fons; el sòl i els edificis comparteixen coordenades i elevacions. La malla de visualització usa passos de 10 m al centre i 40 m a l’exterior en escriptori, i 20/80 m en mòbil, sobre els mateixos fitxers d’elevacions. El mostreig és bilineal i la unió entre malles comparteix altituds.

La cartografia s’emmagatzema localment: el navegador no consulta ICGC ni Cadastre en navegar. Els fitxers ocupen aproximadament 73 MB en total; es carreguen només la fotografia activa, el mapa necessari i les capes activades. Les malles es descarreguen comprimides (uns 4,6 MB); les parcel·les només es descarreguen en activar-les. El visor conserva com a màxim dos conjunts de textures de mapa actius, redueix la resolució de textura en mòbil i deixa de renderitzar quan la càmera no canvia.

## Controls

- Visor interactiu a pantalla completa: botó sota les eines de zoom, amb mapa, cronologia, −/+, capes i panells disponibles. El mateix botó o Esc permet sortir. El documental es pot obrir i tancar dins del visor ampliat. Si el navegador no ofereix pantalla completa nativa, el visor ocupa la finestra disponible.
- Desplaçament lliure amb arrossegament, un dit en pantalla tàctil o WASD/fletxes amb el mapa enfocat. Botó dret per girar; selector «Desplaçar / Girar». Roda, gest de pinça o botons de zoom.
- «Explorar llocs» obre una cerca que ignora majúscules i accents, amb Sant Pere, Sant Antoni, Torre Roja i vuit urbanitzacions. Seleccionar un resultat enfoca el lloc i retorna el focus al mapa; «Veure tot el territori» ofereix l’enquadrament general.
- Selector d’ortofoto, topogràfic o relleu; noms geogràfics ocultables.
- Límits municipals i parcel·les actuals opcionals, sempre identificats com a actuals.
- Selecció d’un edifici: referència cadastral, any, plantes i alçada estimada, amb enllaç al Cadastre.
- Cronologia 872–2026 amb 17 fites i fonts. L’any visible obre un camp numèric validat també en mòbil; el rang admet teclat, les marques salten a anys concrets i els botons − i + al costat de l’any retrocedeixen o avancen exactament un any amb un sol clic; «Cronologia» permet triar una fita. El títol de la fita obre el relat i «Explorar aquest lloc». Fotografies en color accessibles des de «Capes».
- Viatge guiat continu de 5:36, amb 24 capítols i més de dos minuts sobre el creixement modern. Mostra només el relleu fins al capítol final de 2026: una panoràmica territorial revela suaument l’ortofotografia actual (vol de 2025) durant vuit segons i la manté completa els quatre últims. La transició segueix la pausa, la velocitat i els salts temporals; espera la càrrega de les imatges abans d’avançar. En sortir, recupera la capa de mapa que tenia seleccionada el visor. El botó únic «Viatge guiat» obre el documental a pantalla completa, amb alternativa CSS als navegadors sense Fullscreen API, subtítols, capítols, barra de progrés, pausa, velocitats 1×/2×/4× i sortida amb Escape.
- Timelapse dels edificis des de 1850: els volums creixen segons l’any declarat, es mantenen després i es filtren en recular. La durada de l’animació no correspon a la durada real de les obres.
- Patrimoni amb nou models, fitxes de precisió i fonts; accés directe a la Torre Roja i exploració del lloc de cada fita.
- Vols de càmera amb interpolació quíntica, òrbita circular activada explícitament i llum de tarda opcional. El moviment reduït elimina els vols animats i desactiva el vol circular. La interacció manual o ocultar la pestanya interromp el viatge.
- Navegació superior amb Cronologia, Patrimoni i Fonts i dades; «Com navegar pel mapa» explica els controls. Un sol panell contextual obert, tancament amb Escape amb retorn de focus i tancament exterior que permet continuar el gest de mapa.
- Interfície adaptable a mòbil i orientació horitzontal, focus visible i controls principals de 44 px. Cronologia de 164 px en escriptori, 196 px en mòbil i 144 px amb poca alçada; continua disponible si falla la càrrega 3D, amb botó de reintent al visor. El sistema visual blau/blanc i DM Sans es documenta a `DESIGN.md`.

## Què és real i què és estimat

**Mesurat o publicat:** relleu actual, fotografies aèries datades, posicions, límits actuals, empremtes, parcel·les i atributs cadastrals.

**Estimat:** volum dels edificis, calculat amb 2,8 m per planta i un màxim visual de quatre plantes, segons la tipologia local indicada per l’usuari. Els valors cadastrals originals es conserven i es mostren al costat de les plantes representades. La fonamentació utilitza l’altitud mediana de l’empremta, i les finestres parteixen d’aquesta base local per no afegir files segons l’altitud del terreny. Les cobertes són planes, amb fotografia sobre la superfície, i no representen els pendents reals. Les finestres de les façanes són detalls tipològics interpretatius, no un aixecament mesurat. Les parts sense plantes tindrien un volum orientatiu explícit; les de zero plantes no s’eleven. Empremtes degenerades sense superfície útil s’ometen de la malla i es conserven els atributs de l’edifici. Hi ha 47 edificis sense any declarat.

La data cadastral pot correspondre a una reforma o a un valor administratiu: no acredita la data històrica ni la forma original. Des de 1850, la vista **mostra per defecte els volums datats**. El control «Edificis al llarg del temps» permet ocultar-los; les empremtes actuals es filtren per data, amb aquesta limitació visible. Abans de 1850 es representa el poblament tipològic. Els edificis sense data només apareixen en la vista actual.

La cronologia mostra l’última ortofoto **en color** disponible anterior o igual a l’any triat, **indicant l’any real de la fotografia**: per exemple, 2010 usa la de 2004. Els vols en blanc i negre no es carreguen al visor. No s’inventa una fotografia de l’any intermedi. Abans de 2004, es mostra una interpretació rural sobre el relleu actual, amb models patrimonials segons l’època, cases de context hipotètiques fins a 1850 i edificis cadastrals datats a partir d’aquell any. Es pot desactivar la reconstrucció a «Capes». No es presenta una ortofoto moderna com a fotografia antiga. El topogràfic sempre és actual. Durant la càrrega d’una altra fotografia s’oculta l’anterior per no mostrar imatges futures amb una data antiga.

Les capes cadastrals i municipals són actuals, també sobre ortofotos antigues. Els límits de 2026 no es presenten com els de 1843, i el territori medieval de Vilamajor supera els dos termes actuals. Les fites distingeixen el privilegi de vila franca de 1209, el primer ajuntament de 1822 i la culminació de la segregació de 1843.

## Patrimoni i paisatge antic

`public/data/heritage.json` registra nou models: sis monuments conservats —Torre Roja, Sant Pere, Sant Lleïr, Sant Antoni, Santa Susanna i Sant Elies— i tres estats interpretatius de Sant Pere. Cada fitxa identifica fonts, dimensions, dates de visibilitat i limitacions. Els models són originals i paramètrics; **no són fotogrametria**. Només la Torre Roja disposa aquí de dimensions publicades; la resta usa volums aproximats ajustats a empremtes actuals quan es conserva l’edifici.

Sant Pere canvia amb etapes excloents: temple d’Orila (872–1050), temple romànic (1050–1558), obres obertes (1558–1610) i temple actual (des de 1610). Els extrems superiors no són inclusius. Les dates són llindars de visualització, no una datació exacta de cada pedra. Les plantes i alçats antics, l’estat anual de les obres i les bastides són hipotètics.

La Torre Roja té cinc variants (1050, 1663, 1776, 1881 i 1932), amb canvis d’obertures i arrebossat segons el pla director SPAL. No es modela el palau comtal: aquest estudi qüestiona el seu emplaçament tradicional a la Força. Tampoc es trasllada Santa Susanna medieval a l’indret de l’edifici de 1683, ni es presenta la basílica actual de Sant Antoni com el temple de 1789. L’eix de la basílica s’ha corregit amb les vores llargues de la nau cadastral i l’ortofoto 2025: el pòrtic mira a ponent-sud-oest.

Els models patrimonials i la vegetació s’ancoren als triangles del relleu que es dibuixa, amb la mateixa resolució que la malla de cada dispositiu. Al voltant de Sant Elies es conserven els punts del mostreig regional de 20 m per mantenir el detall disponible del turó. Un basament visual segueix el pendent sota la nau, l’annex i l’absis; no representa un mur històric aixecat mètricament. La correcció evita el desajust entre l’alçada del DEM complet i la malla simplificada.

La vegetació deriva de 20.000 punts classificats cromàticament sobre l’ortofoto 2025, amb exclusió d’empremtes edificades. **No és un cens d’arbres**: alçades, formes i capçades són inferides; en mòbil es representa la meitat de les mostres. En èpoques antigues, aquesta distribució i els camps procedimentals són context visual interpretatiu. Hi ha 86 cases rurals de context amb aparició progressiva; les 46 de Sant Antoni evocades per a 1697 són esquemàtiques, sense ubicacions individuals documentades. Es distribueixen en 23 parelles a banda i banda del mateix traçat que dibuixa el camí comtal, amb les façanes orientades al pas i els horts al darrere. Totes les cases, també les de la sagrera, deixen almenys 1,5 m entre el voladís de la teulada i la vora de qualsevol dels dos camins reconstruïts.

L’usuari ha autoritzat decoració inventada per donar vida a les èpoques antigues. `src/period-context.ts` incorpora horts, camps de conreu, camins, fruiters, tanques, mercat, pou, carros, sacs, persones i ovelles, amb aparició per períodes fins a 1850. Els camins comparteixen una reserva geomètrica: la decoració no pot ocupar-ne l’amplada ni un marge de 0,6 m; els carros, arbres fruiters, parades i animals s’avaluen sencers. Tot aquest entorn és imaginat i s’identifica com a tal; els models patrimonials conserven les seves fitxes de fonts separades.

El documental sobrevola Sant Julià d’Alfou, les Faldes del Montseny, les Pungoles, Can Miret, Can Vila, Can Ram, Vallserena i Can Derrocada. Els punts de càmera, no límits administratius, s’han contrastat amb el mapa ICGC i el [DUPROCIM municipal](https://www.vilamajor.cat/media/repository/emergencies/PUBLIC_DUPROCIM_2024/PuBLIC_DUPROCIM_rev_maig_2024_signat_diligenciat.pdf), amb coordenades dels locals socials a les pàgines 52–53. Els períodes de cada vol no són dates de fundació.

Per augmentar encara més la fidelitat calen alçades i cobertes mesurades amb LiDAR/fotogrametria, aixecaments de façanes i recerca arqueològica i cartogràfica de cada etapa. Les dates cadastrals soles no resolen aquesta recerca.

## Regenerar el paquet geogràfic

Cal Python 3.11+ amb accés a internet i Node 22.12+ per a les proves TypeScript.

```sh
python3 -m venv .venv-geo
.venv-geo/bin/pip install -r scripts/requirements.txt
.venv-geo/bin/python scripts/fetch_geodata.py
.venv-geo/bin/python scripts/fetch_microphotos.py
.venv-geo/bin/python scripts/build_vegetation.py
npm run data:geometry
npm test
npm run build
```

Les respostes originals es guarden en `.cache/geodata/`, exclosa de Git. El procés utilitza quatre peticions simultànies com a màxim, fragmenta els serveis amb límits de mida, comprova alineació i valors d’elevació, rebutja ortofotos sense cobertura i no omple buits amb dades inventades. La data cadastral s’extreu de les metadades ISO dels paquets descarregats. El domini, els anys dels vols i la data publicada dels límits estan fixats explícitament a l’script; cal revisar-los en actualitzar el paquet a una altra edició. Les proves d’inventari reflecteixen aquesta edició i cal revisar-les quan les fonts canvien.

`scripts/fetch_microphotos.py` afegeix els vuit retalls de detall dels nuclis i les seves peticions al registre de procedència. Executa’l després del descarregador general.

`build_vegetation.py` utilitza el mateix entorn `.venv-geo` i les dependències geogràfiques, amb llavor fixa per a resultats deterministes. Cal regenerar la vegetació després d’actualitzar ortofotos o empremtes. El filtre inclou verds foscos i olivacis; limita el resultat a 20.000 mostres i agrupa la representació en sectors de 400 m per descartar boscos fora de la vista. `data:geometry` omet els identificadors cadastrals dels monuments de `heritage.json` per evitar volums superposats i actualitza les sumes de verificació de tots els recursos.

`manifest.json` documenta sistema de coordenades, resolució, dates, recomptes i limitacions. `provenance.json` registra URL, mida i SHA-256 de cada resposta oficial. `checksums.json` comprova els fitxers servits. La geometria binària té deu floats per vèrtex: posició, normal, cota de fonamentació, any, plantes representades i coordenada horitzontal de façana. La deformació temporal també s’aplica a les ombres. La triangulació dels volums és prèvia, amb patis i empremtes reals, i queda a `geometry.json` i les malles comprimides.

## Fonts i atribucions

- [ICGC · WCS del model d’elevacions](https://www.icgc.cat/ca/Geoinformacio-i-mapes/Geoinformacio-en-linia-Geoserveis/WMS-i-WCS-Elevacions/WCS-del-Model-dElevacions-del-Terreny).
- [ICGC · Ortofoto territorial](https://www.icgc.cat/ca/Geoinformacio-i-mapes/Dades-i-productes/Imatge/Ortofoto-Territorial).
- [ICGC · Servei de mapa base](https://www.icgc.cat/ca/Geoinformacio-i-mapes/Servei-de-Mapa-Base).
- [ICGC · Divisions administratives](https://www.icgc.cat/ca/Geoinformacio-i-mapes/Dades-i-productes/Geoinformacio-cartografica/Divisions-administratives).
- [Dirección General del Catastro · INSPIRE](https://www.catastro.hacienda.gob.es/webinspire/index.html).

© Institut Cartogràfic i Geològic de Catalunya, CC BY 4.0. © Dirección General del Catastro, Ministerio de Hacienda, reutilització amb atribució. La procedència també es mostra al visor. Les fonts històriques individuals són a `src/history.ts`.

## Verificació

La revisió de navegació del 2026-10-11 ha completat `npm test` (28 proves), `npm run build` i `PLAYWRIGHT_BROWSERS_PATH=/tmp/vilamajor-browsers node tools/ui-browser-check.mjs`. La suite de navegació ha passat amb Chromium i WebGL en escriptori, mòbil emulat, amplada de 320 px, orientació horitzontal i recuperació de fallada de càrrega. Les captures actuals són a `.impeccable/review/`: `desktop`, `desktop-layers`, `desktop-story`, `desktop-tour`, `mobile`, `mobile-layers`, `mobile-story`, `mobile-tour`, `mobile-320` i `mobile-844` (fitxers PNG). Les proves mòbils són de navegador, no d’un dispositiu físic.

`npm test` valida cobertura dels municipis, mostreig i alineació, orientació de coordenades, selecció temporal de fotografies, filtratge històric, etapes patrimonials excloents, variants de la Torre Roja, interpolació de càmera, geometries, dades sense data, procedència i integritat dels fitxers. Per executar la comprovació de navegació, amb el servidor de desenvolupament actiu:

```sh
npx playwright install chromium
node tools/ui-browser-check.mjs
```

La comprovació `node tools/viewer-fullscreen-browser-check.mjs` valida el visor interactiu a pantalla completa: entrada i sortida natives, alternativa sense API o amb petició rebutjada, controls de mapa i any, transicions al documental i retorn de focus. Ha passat en escriptori i mòbil emulat, inclosa l’amplada de 320 px.

`node tools/documentary-finale-browser-check.mjs` comprova la transició final sobre l’escena 3D, la pausa, els salts temporals i la restauració del visor. `node tools/documentary-loading-browser-check.mjs` prova el controlador amb una càrrega d’imatges retardada o fallida.

També hi ha comprovacions específiques de dades, detall, documental i poblament:

```sh
node tools/browser-check.mjs
node tools/detail-browser-check.mjs
node tools/documentary-browser-check.mjs
node tools/settlement-browser-check.mjs
```

Aquests quatre scripts s’han adaptat a la interfície actual, però no s’han tornat a executar en aquesta revisió de navegació. Les seves comprovacions cobreixen selecció cadastral, límits i parcel·les, fotografies datades, geometria, documental i camins reconstruïts. La comprovació de camins audita les 86 cases, la decoració de tots els períodes i les variants patrimonials que poden coincidir amb els camins abans de 1850; les captures d’aquella revisió anterior són a `/tmp/vilamajor-roads-*.png`.
