# Can Bertran: primera restitució exterior

Implementat el 12 d’octubre de 2026. Model original procedimental, sense incorporar fotografies alienes com a textures.

## Evidència consultada

- [Ferran Sarrià, Històries de Vilamajor, 2025](https://www.historiesdevilamajor.cat/can-bertran-de-vilamajor/): reforma atribuïda a Joan Rubió i Bellver, situada entre 1910 i 1920; casa d’estiueig, torratxa i annexos. La tradició familiar d’un origen medieval no prova cap forma arquitectònica. El canvi del camí de l’era es vincula a un acord de 1926; no s’ha reconstruït un traçat sense plànol.
- [Pobles de Catalunya, element 18618](https://www.poblesdecatalunya.cat/element.php?e=18618): adreça França, 36 i localització. Inspecció de les cinc fotografies d’Albert Esteves de 2023 (130767–130771) i de la imatge de 1897 d’Antoni Gallardo / CEC (130692). Permeten contrastar façana, lateral, galeries, cos central i mirador independent.
- DGC INSPIRE local, `public/data/buildings.json`: finca `0336002DG5103N`. Data cadastral 1920 conservada com a dada administrativa, no com a prova de la reforma completa.

## Georeferenciació

Origen EPSG:25831 `[450196.95, 4613438.5]`, rotació de 0,625 radians. La façana principal mira al sud-est. `src/bertran-data.ts` conserva les empremtes, expressades en metres locals, de les parts 2, 11, 17, 19 (casa), 20 (torratxa), 18, 21 i 12 (annexos). La transformació inversa es comprova respecte als vèrtexs originals amb tolerància de 2 mm; això verifica la transformació numèrica, **no** la precisió del model arquitectònic.

Només aquestes vuit parts es retiren de l’extrusió genèrica. La resta de construccions de la finca continuen al Cadastre. El pati queda obert. Les cobertes tenen petits ràfecs interpretats; la seva geometria no és un aixecament mètric. La base s’allarga 65 cm sota el punt de suport per absorbir la variació local del terreny.

## Cronologia i límits

- **1897–1919:** mas baix amb portal, finestres i coberta a dues aigües inspirats en la foto antiga. La planta/profunditat actual és una aproximació; s’ometen annexos antics no prou documentats. 1897 és la primera vista documentada utilitzada, no l’any de construcció.
- **Des de 1920:** representació de la casa reformada, amb tres nivells principals, galeria superior, arcs i balustrades de maó, porticons, cobertes, mirador i escala exterior aproximada. El llindar 1920 representa el final de l’interval 1910–1920, sense afirmar que tots els cossos s’acabessin aquell any.
- No s’atribueix una aparença medieval a l’edifici. Les alçades i cares poc visibles continuen interpretades; calen plànols, aixecament i expedient de reforma per augmentar la fidelitat.

## Integració i comprovacions

Fitxa a Patrimoni amb dos botons d’època, descripció de la fase, fonts i límits de reconstrucció. Capítol documental de 1920 amb vol proper, relleu i subtítols; el documental passa a 25 capítols (5:48). La revelació fotogràfica final manté els seus vuit segons de transició i quatre segons de fotografia completa.

Les proves cobreixen encaix cadastral, substitució parcial, cronologia, alçada antiga, geometries vàlides i compatibles amb la fusió de malles, navegació entre fases i comportament del documental. Fotografies consultades fora dels actius del projecte; no redistribuïdes.
