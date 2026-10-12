import {icon} from './icons';
import {neighborhoods} from './tour';
const close=(label:string)=>`<button class="icon-button panel-close" data-close-panel aria-label="${label}">${icon('close')}</button>`;
export const interfaceTemplate=`
<header class="app-header">
  <a class="brand" href="./" aria-label="Vilamajor, a través del temps">Vilamajor<span>a través del temps</span></a>
  <nav aria-label="Navegació principal">
    <button id="history-button" aria-expanded="false" aria-controls="drawer">${icon('history')}<span>Cronologia</span></button>
    <button id="heritage-button" aria-expanded="false" aria-controls="drawer">${icon('heritage')}<span>Patrimoni</span></button>
    <button id="sources-button" aria-expanded="false" aria-controls="drawer">${icon('book')}<span>Fonts i dades</span></button>
  </nav>
  <span class="header-note">Sant Pere · Sant Antoni</span>
</header>
<main>
<section class="map" id="map-stage" aria-label="Exploració territorial">
  <div id="scene"></div>
  <div id="loading" role="status"><strong>Carregant el territori…</strong><span>Preparem el relleu, les fotografies i els edificis.</span><div class="loading-track" aria-hidden="true"></div></div>
  <div class="map-top map-ui">
    <button id="places-button" class="location-button surface" aria-expanded="false" aria-controls="places-panel" disabled>${icon('pin')}<span><span class="control-label">Explorar llocs</span><strong id="view-title">Els dos nuclis</strong></span>${icon('down')}</button>
    <div class="map-actions"><button id="layers-button" class="surface" aria-expanded="false" aria-controls="layers-panel" disabled>${icon('layers')}<span>Capes</span></button><button id="help-button" class="icon-button surface" aria-expanded="false" aria-controls="help-panel" aria-label="Com navegar pel mapa" title="Com navegar pel mapa">${icon('help')}</button></div>
  </div>
  <div class="map-tools surface map-ui" role="group" aria-label="Enquadrament del mapa">
    <button id="zoom-in" class="icon-button" aria-label="Apropar" title="Apropar" disabled>${icon('plus')}</button>
    <button id="zoom-out" class="icon-button" aria-label="Allunyar" title="Allunyar" disabled>${icon('minus')}</button>
    <button id="reset" class="icon-button" aria-label="Centrar els dos nuclis" title="Centrar els dos nuclis" disabled>${icon('frame')}</button>
    <button id="viewer-fullscreen" class="icon-button" aria-label="Pantalla completa" title="Obrir el visor a pantalla completa" aria-pressed="false" aria-controls="app">${icon('fullscreen')}</button>
  </div>
  <div class="map-navigation map-ui">
    <div class="free-controls surface" role="group" aria-label="Navegació del mapa"><button id="move-mode" aria-pressed="true" disabled>${icon('move')}<span>Desplaçar</span></button><button id="rotate-mode" aria-pressed="false" disabled>${icon('rotate')}<span>Girar</span></button></div>
    <button id="orbit" class="surface" aria-pressed="false" disabled>${icon('rotate')}<span>Vol circular</span></button>
  </div>
  <div class="map-bottom"><span id="map-status" role="status" class="map-ui">Preparant dades geogràfiques…</span><span class="model-note"><a href="https://www.icgc.cat/" target="_blank" rel="noopener noreferrer">© ICGC</a> · <a href="https://www.catastro.hacienda.gob.es/webinspire/index.html" target="_blank" rel="noopener noreferrer">© D. G. del Catastro</a><span class="project-credit map-ui"> · <a href="https://github.com/jordeu/vilamajor-historic" target="_blank" rel="noopener noreferrer" aria-label="Projecte de jordeu a GitHub (s’obre en una pestanya nova)">GitHub · jordeu</a></span></span></div>

  <section id="places-panel" class="map-panel map-ui" hidden role="dialog" aria-labelledby="places-title" tabindex="-1">
    <div class="panel-heading"><h2 id="places-title">On vols anar?</h2>${close('Tancar llocs')}</div>
    <label class="search-field">${icon('search')}<span class="sr-only">Cercar un lloc</span><input id="place-search" type="search" placeholder="Cerca un poble o una urbanització" autocomplete="off" data-initial-focus></label>
    <div class="places-list">
      <button id="focus-pere" data-place-name="Sant Pere de Vilamajor" disabled><span>Sant Pere de Vilamajor<small>Nucli històric</small></span>${icon('arrow')}</button>
      <button id="focus-antoni" data-place-name="Sant Antoni de Vilamajor" disabled><span>Sant Antoni de Vilamajor<small>Nucli històric</small></span>${icon('arrow')}</button>
      <button id="landmark-focus" data-place-name="Torre Roja" disabled><span>Torre Roja<small>La Força · Sant Pere</small></span>${icon('arrow')}</button>
      ${neighborhoods.map(p=>`<button data-neighborhood="${p.id}" data-place-name="${p.name}" disabled><span>${p.name}<small>Urbanització</small></span>${icon('arrow')}</button>`).join('')}
    </div>
    <p id="place-empty" role="status" hidden>No hem trobat cap lloc. Prova un altre nom.</p>
    <button id="overview" class="secondary-button" disabled>${icon('frame')}Veure tot el territori</button>
  </section>
  <section id="layers-panel" class="map-panel map-ui" hidden role="dialog" aria-labelledby="layers-title" tabindex="-1">
    <div class="panel-heading"><h2 id="layers-title">Capes del mapa</h2>${close('Tancar capes')}</div>
    <h3>Mapa de base</h3><div class="layer-switch" role="group" aria-label="Cartografia"><button data-layer="photo" aria-pressed="true" disabled>Ortofoto</button><button data-layer="topographic" aria-pressed="false" disabled>Topogràfic</button><button data-layer="terrain" aria-pressed="false" disabled>Relleu</button></div>
    <h3>Paisatge i edificis</h3>
    <label class="switch-row"><span>Reconstrucció històrica<small>Patrimoni i entorn imaginat</small></span><input id="reconstruction-toggle" type="checkbox" role="switch" checked></label>
    <label class="switch-row"><span>Edificis al llarg del temps<small>Segons la data cadastral, des de 1850</small></span><input id="volumes-toggle" type="checkbox" role="switch" checked></label>
    <label class="switch-row"><span>Vegetació en volum</span><input id="vegetation-toggle" type="checkbox" role="switch" checked></label>
    <label class="switch-row"><span>Llum de tarda</span><input id="light-toggle" type="checkbox" role="switch" checked></label>
    <button id="labels" class="toggle-row" aria-pressed="true" disabled>${icon('eye')}<span>Noms dels llocs</span><span class="toggle-status">Visibles</span></button>
    <h3>Cartografia actual</h3>
    <label class="switch-row"><span>Límits municipals actuals</span><input id="boundaries-toggle" type="checkbox" role="switch"></label>
    <label class="switch-row"><span>Parcel·les cadastrals actuals</span><input id="parcels-toggle" type="checkbox" role="switch"></label>
    <p class="panel-note">Les empremtes són actuals. Les dates cadastrals no documenten cada reforma ni enderroc.</p>
    <div class="photo-jumps" id="photo-jumps" aria-label="Fotografies aèries disponibles"></div>
  </section>
  <section id="help-panel" class="map-panel map-ui" hidden role="dialog" aria-labelledby="help-title" tabindex="-1">
    <div class="panel-heading"><h2 id="help-title">Explora al teu ritme</h2>${close('Tancar ajuda')}</div>
    <dl class="help-list"><dt>Moure’t pel mapa</dt><dd>Arrossega amb el ratolí o amb un dit. Amb el mapa seleccionat, també pots fer servir <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> o les fletxes.</dd><dt>Canviar el punt de vista</dt><dd>Tria «Girar» o arrossega amb el botó dret. «Desplaçar» torna al moviment lliure.</dd><dt>Apropar i allunyar</dt><dd>Fes servir la roda, els botons + i −, o un gest de pinça amb dos dits.</dd><dt>Viatjar en el temps</dt><dd>Prem − o + al costat de l’any per retrocedir o avançar un any. També pots arrossegar la línia del temps, tocar l’any per escriure una data o obrir «Cronologia» per triar una fita.</dd><dt>Visor a pantalla completa</dt><dd>Prem el botó de pantalla completa sota les eines de zoom. Pots continuar movent el mapa, canviant l’any i consultant les capes. Torna a prémer el botó o prem Esc per sortir.</dd><dt>Descobrir un edifici</dt><dd>Toca un edifici per consultar-ne la informació i les fonts.</dd></dl>
    <p class="panel-note">Prem <kbd>Esc</kbd> per tancar un panell o sortir del viatge guiat. El moviment s’adapta a les preferències d’accessibilitat del dispositiu.</p>
  </section>
  <section class="story map-panel map-ui" id="story-panel" hidden role="dialog" aria-labelledby="event-title" tabindex="-1">
    <div class="panel-heading"><span id="event-count"></span>${close('Tancar la fita històrica')}</div>
    <div class="event"><h2 id="event-title"></h2><p id="event-date"></p><p id="event-text"></p><a id="event-source" target="_blank" rel="noopener noreferrer">Llegir la font ${icon('external')}</a></div>
    <div class="story-explore"><button id="explore-event" class="primary-button" disabled>Explorar aquest lloc ${icon('arrow')}</button><p id="evidence-note"></p></div>
  </section>
  <section id="year-panel" class="map-panel map-ui" hidden role="dialog" aria-labelledby="year-title" tabindex="-1"><div class="panel-heading"><h2 id="year-title">Anar a un any</h2>${close('Tancar selector d’any')}</div><form id="year-form"><label for="year-input">Entre 872 i 2026</label><div class="year-entry"><input id="year-input" type="number" min="872" max="2026" step="1" value="2026" required inputmode="numeric" data-initial-focus><button type="submit" class="primary-button">Anar-hi ${icon('arrow')}</button></div></form></section>
  <section id="building-detail" class="map-panel map-ui" hidden role="dialog" aria-label="Edifici seleccionat" tabindex="-1"></section>
  <aside id="drawer" class="map-panel map-ui" hidden role="dialog" aria-label="Informació de Vilamajor" tabindex="-1"></aside>

  <div id="tour-overlay" hidden><div class="film-heading"><strong id="film-year">872</strong><h2 id="film-place"></h2></div><div class="film-subtitle"><p id="film-caption"></p><span id="film-evidence"></span></div></div>
  <div id="film-controls" hidden><div class="film-top-controls"><label class="sr-only" for="film-chapter">Capítol del viatge</label><select id="film-chapter"></select><button id="film-exit" aria-label="Sortir del viatge guiat">${icon('close')}<span>Tancar</span></button></div><div class="film-transport"><label class="sr-only" for="film-seek">Posició del viatge</label><input id="film-seek" type="range" min="0" step="0.1" value="0"><div><button id="film-previous" aria-label="Capítol anterior">${icon('left')}</button><button id="film-play">Pausa</button><button id="film-next" aria-label="Capítol següent">${icon('right')}</button><span id="film-time"></span><label for="film-speed" class="sr-only">Velocitat del viatge</label><select id="film-speed"><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select><button id="film-subtitles" aria-pressed="true" aria-label="Mostrar subtítols">Subtítols</button></div></div></div>
</section>
</main>
<footer class="timeline" aria-label="Línia del temps">
  <div class="time-heading"><div class="year-navigation"><button id="previous" class="icon-button" aria-label="Any anterior" title="Retrocedir un any">${icon('minus')}</button><button id="year-jump" aria-controls="year-panel" aria-expanded="false" aria-label="Canviar l’any"><strong id="year-display" aria-live="polite" aria-atomic="true"></strong>${icon('down')}</button><button id="next" class="icon-button" aria-label="Any següent" title="Avançar un any">${icon('plus')}</button></div><button id="story-toggle" aria-controls="story-panel" aria-expanded="false"><span><strong id="current-event"></strong></span>${icon('book')}</button><button id="play" class="primary-button" disabled aria-label="Obrir el viatge guiat a pantalla completa" aria-controls="map-stage" aria-expanded="false">${icon('play')}<span>Viatge guiat</span></button></div>
  <label class="sr-only" for="time">Any del paisatge</label><input id="time" type="range" min="872" max="2026" value="2026" step="1">
  <div class="timeline-ticks">${[872,1150,1558,1843,2026].map(y=>`<button data-year="${y}" style="--position:${(y-872)/1154*100}%" aria-label="Anar a l’any ${y}">${y}</button>`).join('')}</div>
</footer>`;
