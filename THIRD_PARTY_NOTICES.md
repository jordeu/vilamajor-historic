# Materials de tercers

La [llicència MIT](LICENSE), copyright © 2026 Jordi Deu-Pons, s’aplica al codi
propi i a la documentació original de Vilamajor a través del temps. No canvia
les llicències de les dependències, les dades geogràfiques, les imatges ni els
altres materials de tercers, inclosos els seus derivats.

## Cartografia i dades

- **Institut Cartogràfic i Geològic de Catalunya (ICGC):** elevacions, ortofotos,
  cartografia topogràfica i límits administratius. La geoinformació pròpia
  de l’ICGC és © ICGC, CC BY 4.0; els materials d’altres titulars en conserven
  les condicions específiques.
  Les fotografies es retallen i es converteixen a WebP; el relleu es mostreja
  i es transforma en malles; la vegetació es deriva de mostres cromàtiques.
- **Vol americà de 1956:** les ortofotos d’arxiu `ortho-1956*.webp` provenen
  del vol Army Map Service dels EUA, distribuït per l’ICGC a partir dels
  acords amb el Ministerio de Defensa i el CNIG. No es mostren al visor.
  No s’hi estén la MIT ni s’hi pressuposa la llicència general de les dades
  pròpies de l’ICGC: cal consultar les condicions específiques del proveïdor.
- **Dirección General del Catastro, Ministerio de Hacienda:** empremtes i parts
  d’edificis, parcel·les, plantes i dates declarades. Es mantenen l’atribució i
  les condicions de reutilització del proveïdor. Les malles i les plantes de
  masies derivades d’aquestes dades també en conserven la procedència.
- **Fonts històriques i arquitectòniques:** les fitxes de
  `public/data/heritage.json`, `src/history.ts` i `research/` identifiquen les
  fonts utilitzades. La MIT no concedeix drets sobre les publicacions o
  fotografies enllaçades.

Les dades i els recursos de `public/data/` no queden coberts en bloc per la MIT:
consulteu `manifest.json`, `provenance.json`, les fitxes patrimonials i
[l’inventari de procedència](research/source-provenance.md). Les captures del
visor també contenen cartografia subjecta a les condicions anteriors.

Fonts i condicions:

- [ICGC · Reutilització de la informació](https://www.icgc.cat/ca/LICGC/Informacio-publica/Transparencia/Reutilitzacio-de-la-informacio)
- [ICGC · Ortofoto territorial i procedència dels vols](https://www.icgc.cat/ca/Geoinformacio-i-mapes/Dades-i-productes/Imatge/Ortofoto-Territorial)
- [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)
- [Dirección General del Catastro · INSPIRE](https://www.catastro.hacienda.gob.es/webinspire/index.html)

## Programari i tipografia

Les dependències npm conserven els avisos i les llicències distribuïts amb
cadascun dels paquets; les versions exactes són a `package-lock.json`.
Les eines Python declaren les seves dependències a `scripts/requirements.txt`.
DM Sans es carrega des de Google Fonts i conserva la seva llicència tipogràfica.

La compilació distribuïda inclou `LICENSE`, aquest document i
`THREE-LICENSE.txt` amb l’avís original de Three.js, la dependència del visor.

Quan es redistribueixi el visor, cal conservar els avisos de llicència del
programari i les atribucions dels proveïdors de dades.
