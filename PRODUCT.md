# Vilamajor a través del temps
<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
TypeScript, Vite i Three.js. Processament previ amb Python, inclosa classificació cromàtica de vegetació; dades servides com a fitxers estàtics locals.

## Product Purpose
Explorar l’evolució històrica de Vilamajor, avui Sant Pere i Sant Antoni, amb un mapa 3D interactiu, una cronologia documentada i un recorregut audiovisual pel territori.

## Capabilities and Constraints
Interfície en català. Història comuna i segregació municipal. L’usuari ha demanat explícitament incorporar relleu, cartografia, cadastre i edificis reals per augmentar la fidelitat. L’usuari també ha autoritzat reconstrucció d’èpoques antigues, modelatge amb fonts, més realisme i millores de disseny. La implementació ja mostra elevacions i ortofotos ICGC, límits oficials actuals, parcel·les i empremtes DGC INSPIRE dels dos municipis, i volums estimats a partir de les plantes declarades. L’última revisió incorpora façanes de poques plantes (2,8 m per planta, màxim visual de quatre), orientació corregida de Sant Antoni, fotografia exclusivament en color, desplaçament lliure, documental de 31 capítols (7 minuts) a pantalla completa, subtítols i timelapse cadastral continu. El tram modern sobrevola vuit urbanitzacions identificades.

La modernització autoritzada de la navegació incorpora cerca de llocs, un únic panell contextual cada vegada, selector d’any validat també en mòbil, ajuda de controls i una cronologia persistent. El viatge guiat continua sent l’únic mode de reproducció. La interfície utilitza DM Sans, navegació blava i lectura sobre blanc; `DESIGN.md` registra el sistema implementat. El mapa com a espai principal és una hipòtesi de treball del redisseny, no una prioritat de públic confirmada.

Les dades actuals no es presenten com a reconstruccions arqueològiques. Les alçades són estimacions; les cobertes són planes. Les dates cadastrals no certifiquen la forma històrica. Les capes de límits i parcel·les sempre s’identifiquen com a actuals, fins i tot sobre ortofotos antigues. Abans de la primera fotografia es mostra un paisatge rural interpretatiu, explícitament hipotètic, amb models patrimonials segons l’època. Divuit models cobreixen sis monuments conservats, tres estats antics de Sant Pere, Can Bertran, Ca l’Auferil, Casa Gil Miret, Can Miquel Cortès, La Dàlia, La Jardinera, Can Gol de la Torre, Can Derrocada i Can Llinars / Can Sagarra; la Torre Roja té cinc variants. Els tres masos incorporen accessos, horts, murs baixos, arbrat i espais de treball interpretats, amb canvis temporals reversibles, materials procedimentals i aproximacions documentals del conjunt a la façana. Can Bertran incorpora el mas fotografiat el 1897 i una interpretació de la reforma de 1910–1920, amb selecció directa des de la fitxa i un capítol documental. Vegetació classificada sobre l’ortofoto actual i cases rurals esquemàtiques aporten context, sense certificar distribucions antigues. L’usuari autoritza expressament inventar decoració d’època: camps, horts, camins, mercat, pous, carros, persones i bestiar, identificats com a imaginats. Des de 1850 es mostren per defecte empremtes actuals segons dates cadastrals; abans de l’ortofoto en color de 2004, el terreny és una interpretació rural en color. El palau comtal resta sense model perquè SPAL qüestiona l’emplaçament tradicional.

## Users
Hipòtesi pendent de confirmar: veïns, visitants i persones interessades en la història local.

## Evidence on Hand
Fonts històriques: ajuntaments de Sant Pere i Sant Antoni i Enciclopèdia Catalana. Dades geogràfiques: `public/data/manifest.json`; procedència, peticions i hashes originals: `public/data/provenance.json`; integritat dels fitxers: `public/data/checksums.json`. Procés reproduïble: `scripts/fetch_geodata.py`, `scripts/build_vegetation.py` i `tools/build-geometry.mjs`. Fonts, precisió i limitacions patrimonials: `public/data/heritage.json`; models originals: `src/heritage.ts`, `src/bertran.ts`, `src/residential.ts` i `src/farmsteads.ts`. Recerca de cases i masies: `research/heritage-candidates.json`; encaix i fases de Can Bertran: `research/can-bertran.md`; cases modernistes i de la Força: `research/residential-models.md`; masies i etapes interpretades: `research/farmstead-models.md`.

## Open decisions
Públic prioritari i destí de desplegament. La fidelitat arquitectònica superior, les alçades mesurades i la verificació arqueològica de les reconstruccions necessiten dades i recerca pròpies. El públic prioritari continua pendent de confirmar.
