---
name: Vilamajor a través del temps
description: Exploració territorial i històrica en català, amb navegació blava i lectura sobre blanc.
colors:
  ink: "#17283e"
  muted: "#53647b"
  blue: "#2257b8"
  blue-hover: "#17438f"
  navy: "#173761"
  surface: "#fff"
  tint: "#eaf0fb"
  line: "#dce4ee"
  focus: "#326de0"
  background: "#edf2f8"
  input-background: "#f8fafd"
  input-border: "#bccbde"
  active: "#d9e4f8"
  primary-active: "#123470"
  header-text: "#e1eafa"
  header-hover: "#2c4e7c"
  evidence-background: "#e7f1ed"
  evidence-text: "#2b5848"
  hypothesis-background: "#fbefdb"
  hypothesis-text: "#785018"
  film-background: "#14243a"
typography:
  display:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "80px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-.04em"
  headline:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "25px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.025em"
  title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "21px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-.025em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 500
  year:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-.035em"
rounded:
  badge: "4px"
  inset-control: "6px"
  control: "8px"
  panel: "14px"
spacing:
  tight: "4px"
  compact: "8px"
  small: "12px"
  medium: "16px"
  panel-mobile: "20px"
  panel-desktop: "24px"
  shell-desktop: "28px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0 18px"
  button-primary-hover:
    backgroundColor: "{colors.blue-hover}"
    textColor: "{colors.surface}"
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
  button-secondary:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.blue-hover}"
    rounded: "{rounded.control}"
    padding: "0 12px"
  button-ghost:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    typography: "{typography.label}"
  icon-button:
    rounded: "{rounded.control}"
    width: "44px"
    height: "44px"
  search-field:
    backgroundColor: "{colors.input-background}"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "0 12px"
  year-field:
    backgroundColor: "{colors.input-background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  navigation:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.header-text}"
  layer-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.blue-hover}"
    rounded: "{rounded.control}"
    padding: "0 8px"
  contextual-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "24px"
    width: "360px"
  evidence-badge:
    backgroundColor: "{colors.evidence-background}"
    textColor: "{colors.evidence-text}"
    rounded: "{rounded.badge}"
    padding: "6px 9px"
  hypothesis-badge:
    backgroundColor: "{colors.hypothesis-background}"
    textColor: "{colors.hypothesis-text}"
    rounded: "{rounded.badge}"
    padding: "6px 9px"
---

# Design System: Vilamajor a través del temps

## Overview

**Creative North Star: "Cartografia cultural contemporània"**

Una interfície territorial en català amb tipografia clara, blau de navegació i superfícies blanques. La jerarquia es construeix amb pes tipogràfic, contrast i agrupació dels controls; el paisatge conserva els seus materials cartogràfics i les seves reconstruccions documentades o interpretatives.

Aquest document registra el sistema implementat després de la modernització autoritzada. El mapa com a espai principal és la hipòtesi de treball aplicada a aquesta superfície, pendent de confirmar com a prioritat de públic; el contracte de superfície és a `.impeccable/surfaces/src-main-ts.md`. Els valors de la capçalera YAML són normatius; les extensions i les previsualitzacions autònomes són a `.impeccable/design.json`.

**Key Characteristics:**

- DM Sans per a títols, lectura, anys i controls.
- Navegació blava, lectura blanca i estats explícits.
- Controls agrupats, panells contextuals i cronologia persistent.
- Fonts, atribucions i límits de la reconstrucció visibles.

## Colors

Blau profund per orientar-se, blanc per llegir i grisos freds per organitzar la informació; els colors semàntics d’evidència es reserven a les fitxes patrimonials.

### Primary

- **Blau d’acció** (`blue`): acció principal, any recorregut a la barra temporal, selectors i interruptors activats. `blue-hover` i `primary-active` en defineixen la resposta.
- **Blau de navegació** (`navy`): banda de capçalera; `header-text` i `header-hover` resolen els controls sobre aquest fons.
- **Blau de focus** (`focus`): contorn de teclat sobre superfícies clares. La capçalera i el documental tenen variants clares adaptades al fons fosc.
- **Blau pàl·lid** (`tint`): selecció de moviment, botons secundaris i superfícies obertes. `active` identifica la pressió d’un control ordinari.

### Secondary

- **Verd d’evidència** (`evidence-background`, `evidence-text`): etiqueta de precisió patrimonial documentada o aproximada.
- **Ocre d’hipòtesi** (`hypothesis-background`, `hypothesis-text`): etiqueta explícita de reconstrucció hipotètica. El text sempre acompanya el color.

### Neutral

- **Tinta** (`ink`) i **lectura secundària** (`muted`): jerarquia de text.
- **Blanc de superfície** (`surface`): panells, eines, barra temporal i text de l’acció principal.
- **Fons fred** (`background`): càrrega i fons de l’aplicació. **Línia suau** (`line`): separadors interns.
- **Camp clar** (`input-background`, `input-border`): cerca i entrada de l’any.
- **Fons documental** (`film-background`): superfície de reproducció ampliada. Els degradats foscos són específics dels subtítols sobre el paisatge.

**The Blau funcional Rule.** El blau identifica accions i estats de navegació; els colors d’evidència només expressen la naturalesa de les dades.

## Typography

**Display Font:** DM Sans, amb alternativa sans-serif.
**Body Font:** DM Sans, amb alternativa sans-serif.

Una sola família de traç clar manté continuïtat entre exploració i lectura. La font es carrega de Google Fonts; la família genèrica és l’alternativa quan no està disponible.

### Hierarchy

- **Display:** any del documental. En mòbil passa a (58px) i en finestres de poca alçada a (44px).
- **Headline:** títol de la fita històrica; en mòbil passa a (23px).
- **Title:** capçalera del panell; en mòbil passa a (20px). Els títols generals parteixen de (22px); el calaix principal utilitza (23px).
- **Body:** paràgrafs generals; les fitxes i els calaixos fan servir (13px), amb interlineat contextual entre (1.65) i (1.75).
- **Label:** botons i controls. Les notes secundàries utilitzen (11–12px); no són una mida de referència per a nous controls principals.
- **Year:** any interactiu de la cronologia; (29px) en mòbil, (27px) fins a (360px) d’amplada i (25px) amb poca alçada.

Els subtítols del documental són (23px), (17px) en mòbil i (15px) en poca alçada. Les icones són SVG de línia amb traç (1.7), habitualment dins d’una caixa de (20px); les icones decoratives queden fora del nom accessible.

**The Una família Rule.** DM Sans resol tota la interfície; la jerarquia depèn de mida, pes i espai, i els anys utilitzen xifres tabulars.

## Layout

L’aplicació ocupa (100dvh), amb capçalera, mapa flexible i cronologia inferior. En escriptori, capçalera de (68px) i cronologia de (164px). El mapa utilitza marges de control de (24px); la capçalera i la cronologia, (28px). A partir del llindar de (900px) cap avall, alguns marges baixen a (20px).

Fins a (640px), la capçalera fa (60px), la cronologia (196px) i els controls del mapa se situen a (12px) de les vores. La cronologia distribueix any i Viatge guiat a la primera fila, i la fita a la segona. Els noms accessibles de la navegació superior es conserven quan els textos esdevenen visualment ocults. Fins a (360px), es compacten espais i mides de l’any sense reduir les àrees dels botons principals.

Amb una alçada màxima de (540px), inclosa l’orientació horitzontal curta, la capçalera fa (52px) i la cronologia (144px). Les eines de zoom es col·loquen en fila i els panells limiten l’alçada al mapa disponible. Aquesta regla s’aplica després de les regles d’amplada.

Els panells contextuals fan (360px) d’amplada, amb un calaix informatiu de (400px), contingut desplaçable i capçalera de tancament persistent. En mòbil es converteixen en fulls dins del mapa amb marges laterals i inferior de (12px), espai interior de (20px) i alçada màxima `calc(100% - 84px)`. La cronologia continua disponible sota aquests panells. La regla d’un sol panell manté net el context de lectura.

## Elevation & Depth

Superfícies opaques i ombres ambientals separen la interfície del mapa. El territori aporta el relleu i la llum; la interfície usa ombres suaus sense desplaçaments durs.

### Shadow Vocabulary

- **Eines flotants** (`0 4px 16px #102a4926`): grups sobre el mapa.
- **Panell contextual** (`0 10px 32px #11294b26`): lectura oberta.
- **Etiqueta geogràfica** (`0 3px 12px #142c4726`): noms ancorats al territori.
- **Segment actiu** (`0 2px 5px #142c4714`): selecció blanca del mapa de base.
- **Cursor temporal** (`0 1px 5px #13316355`): control circular sobre el carril.

**The Profunditat funcional Rule.** L’ombra separa controls i panells del paisatge; no substitueix l’estat seleccionat ni la jerarquia de lectura.

## Shapes

Cantonades suaus diferenciades per funció: control ordinari, control dins d’un grup, panell i etiqueta d’evidència segueixen les primitives `rounded`. El carril temporal és fi (5px) i el cursor és circular. Els interruptors fan (36 × 22px), dins de files clicables d’alçada mínima (52px); la forma visual del commutador no defineix l’àrea d’interacció.

Els botons principals tenen una alçada mínima de (44px), amb icones dins de botons quadrats d’aquesta mateixa mida. Els camps de cerca tenen una alçada mínima de (46px) i el camp d’any, (48px). Les vores fines delimiten camps i separacions; les superfícies no necessiten totes un contorn.

## Components

### Buttons

Accions clares amb color i estat explícits. El primari utilitza blau i text blanc, amb pes (600); el secundari, fons pàl·lid i text blau. Els botons neutres hereten tinta i fan servir el fons pàl·lid en hover. La resposta de color dura (.16s). Els botons desactivats tenen opacitat (.4) i no activen resposta de hover.

El focus visible general és un contorn blau de (3px), separat (3px). Sobre la capçalera es fa clar. Els grups de Desplaçar / Girar indiquen selecció amb `aria-pressed`; Vol circular és una activació explícita. Zoom, reenquadrament, moviment, controls de temps i marques de la cronologia mantenen àrees principals de (44px).

### Chips

Les etiquetes d’evidència són informatives, amb text (11px) i color semàntic. Identifiquen proporcions documentades, restitució aproximada o hipòtesi de reconstrucció; no es confonen amb filtres de navegació.

### Cards / Containers

La lectura utilitza el panell contextual blanc, ombra ambiental i cantonada de panell. Un sol panell pot estar obert. Obrir-ne un altre tanca l’anterior, actualitza `aria-expanded` i mou el focus al camp o control inicial. Escape i el tancament retornen el focus a l’origen. Una pulsació exterior tanca sense consumir el gest que comença al mapa. Són diàlegs no modals; el mapa i la cronologia continuen operables.

L’inspector cadastral mostra atributs originals, plantes representades i estimació d’alçada. La fitxa patrimonial mostra precisió, fonts i «Què sabem i què interpretem?». Les limitacions s’expliquen amb text, i els enllaços de fonts es mantenen visibles.

### Inputs / Fields

La cerca de llocs combina icona SVG i camp amb etiqueta accessible. Té fons clar, vora definida i focus de grup amb contorn (3px) separat (2px). En mòbil el text de l’entrada puja a (16px). La coincidència ignora majúscules i accents, i mostra «No hem trobat cap lloc. Prova un altre nom.» quan cal. Triar un lloc actualitza el títol, tanca el panell i enfoca el mapa.

L’any visible obre «Anar a un any» tant en escriptori com en mòbil. El camp numèric selecciona el valor actual i exigeix un enter entre (872) i (2026), amb validació nativa i acció Anar-hi. Una entrada vàlida actualitza la cronologia i tanca el panell.

### Navigation

La banda superior ofereix Cronologia, Patrimoni i Fonts i dades. El panell obert es reconeix amb fons blanc i text blau fosc. En mòbil els botons mantenen icones i noms accessibles. Llocs, Capes i ajuda queden sobre el mapa; Desplaçar / Girar, zoom i centrat formen grups coherents.

Capes agrupa el selector Ortofoto / Topogràfic / Relleu, visibilitat del paisatge, cartografia actual i fotografies disponibles. La selecció de base és blanca sobre un contenidor gris fred, amb text blau i `aria-pressed`. Els interruptors exposen el seu estat. «Com navegar pel mapa» explica arrossegament, botó dret, pinça, roda i WASD/fletxes amb el mapa enfocat.

### Cronologia

La signatura és el carril continu emplenat en blau segons l’any, vinculat a la data, la fita i el paisatge. L’entrada de rang nativa conserva el teclat, pas anual i `aria-valuetext` amb l’any i el títol. Les marques de data són accionables i proporcionals, amb ajust de la penúltima marca per evitar solapaments en pantalles estretes. Els botons − i + al costat de l’any retrocedeixen o avancen un any immediatament, amb límits desactivats a 872 i 2026. El calaix Cronologia permet triar fites. El títol de la fita obre el relat, la font i Explorar aquest lloc.

### Viatge guiat

L’acció única de la cronologia obre un documental a pantalla completa amb alternativa CSS. El mapa esdevé un diàleg modal; la capçalera i la cronologia queden inertes, el focus entra a Tancar i Tab queda contingut en el visor. Escape o Tancar aturen el viatge i retornen el focus a l’acció d’origen.

El visor interactiu disposa d’un botó de pantalla completa a les eines d’enquadrament, amb estat `aria-pressed`, icona de sortir i retorn de focus. Amplia tota l’aplicació, conservant navegació, cronologia i panells. Esc tanca primer un panell en el mode de finestra ampliada i surt del visor quan no n’hi ha cap; la sortida nativa del navegador també sincronitza l’estat. Obrir i tancar el documental dins d’una sessió del visor conserva aquesta sessió.

El documental conserva capítols, progrés, pausa, anterior/següent, velocitats (1×/2×/4×), subtítols i atribucions. El fons blau fosc i els degradats permeten llegir l’any, el lloc i el text sobre el paisatge. El relat manté la durada de (5:36) i (24) capítols. Amb moviment reduït, els enquadraments són immediats, no hi ha deriva de càmera ni creixement animat, i el vol circular queda desactivat. La interacció manual o ocultar la pestanya atura la reproducció.

### Càrrega i moviment

La càrrega cobreix només el mapa amb fons fred, explicació i indicador. Els controls dependents de dades estan desactivats. Si hi ha una fallada de dades o WebGL, la cronologia continua disponible i Tornar a provar recupera la càrrega.

Els panells entren amb un desplaçament vertical de (8px) durant (.2s), amb `cubic-bezier(.16,1,.3,1)`, només sense preferència de moviment reduït. Aquesta preferència elimina transicions i animacions CSS. Els vols de càmera conserven la interpolació quíntica i la interrupció manual. El renderitzat es deté en repòs.

## Do's and Don'ts

### Do:

- Do mantenir DM Sans, el blau funcional i les superfícies blanques en les extensions de la interfície.
- Do conservar àrees de 44px als controls principals, contorn de focus visible i noms accessibles per a les icones.
- Do obrir un sol panell contextual i retornar el focus amb Escape o el botó de tancament.
- Do mantenir visibles atribucions, fonts i distincions entre fotografia datada, dades actuals, estimacions i reconstruccions.
- Do respectar el moviment reduït i verificar les composicions mòbil, estreta i horitzontal.

### Don't:

- Don't recuperar el paper crema ni els títols amb serif del sistema substituït.
- Don't presentar capes actuals, decoració imaginada o volums estimats com a evidència històrica mesurada.
- Don't substituir noms de lloc i d’acció per codis de dades ni deixar accions essencials només en hover.
- Don't afegir un segon mode de reproducció: Viatge guiat és l’entrada única al documental.

### Entorns de les masies i càmera documental

Els conjunts rurals de Can Gol, Can Derrocada i Can Llinars amplien el paisatge amb accessos continus, arbrat i espais de treball, mantenint les fitxes d’evidència existents. La composició reserva la façana i el pas principal; el verd fosc de les capçades emmarca la pedra i els arrebossats clars. Teula, calç, pedra i fusta incorporen variació procedimental a escala mètrica, sense noves imatges distribuïdes.

Als tres capítols, la càmera presenta l’entorn, s’acosta a la façana i hi acaba aturada. Els salts de temps determinen el mateix enquadrament; pausa i moviment reduït conserven una vista estable. La resta de la navegació, la tipografia i els controls mantenen el contracte existent. La decoració i els seus canvis temporals continuen identificats com a interpretats a les fitxes. Recerca i límits: `research/farmstead-models.md`.
