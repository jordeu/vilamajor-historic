export interface TourShot {from:number;to:number;seconds:number;title:string;place:string;captions:string[];center:[number,number];span:number;angle:number;elevation?:number;approach?:{span:number;angle:number;elevation:number;center?:[number,number]};evidence?:string;}
/** Camera anchors, not administrative boundaries. Cross-checked against ICGC cartography.
 * Can Ram, Can Vila and Faldes: municipal DUPROCIM 2024, pp. 52–53.
 * https://www.vilamajor.cat/media/repository/emergencies/PUBLIC_DUPROCIM_2024/PuBLIC_DUPROCIM_rev_maig_2024_signat_diligenciat.pdf
 */
export const neighborhoods=[
  {id:'alfou',name:'Sant Julià d’Alfou',center:[448540,4611010] as [number,number],span:900},
  {id:'faldes',name:'Les Faldes del Montseny',center:[447286,4615457] as [number,number],span:800},
  {id:'pungoles',name:'Les Pungoles',center:[447470,4613030] as [number,number],span:650},
  {id:'miret',name:'Can Miret',center:[448160,4613100] as [number,number],span:600},
  {id:'vila',name:'Can Vila',center:[451082,4614215] as [number,number],span:750},
  {id:'ram',name:'Can Ram',center:[451867,4614327] as [number,number],span:800},
  {id:'vallserena',name:'Vallserena',center:[450770,4615550] as [number,number],span:650},
  {id:'derrocada',name:'Can Derrocada',center:[449860,4614750] as [number,number],span:800},
];
const pere:[number,number]=[449075,4614888],antoni:[number,number]=[450150,4613710];
const history:{from:number;title:string;place?:string;center?:[number,number];span?:number;angle?:number;elevation?:number;approach?:{span:number;angle:number;elevation:number;center?:[number,number]};evidence?:string;captions:string[]}[]=[
  {from:872,title:'La memòria d’Orila',captions:['La làpida d’Orila ens parla d’una comunitat cristiana al segle IX.','El temple i la vida rural del voltant són una evocació: no en coneixem l’aspecte exacte.']},
  {from:950,title:'La terra de Vilamajor',span:460,captions:['El document de l’any 950 esmenta la Terra de Goma. Camps, masos i camins articulen el territori.','Horts, ramats i petits espais de treball donen vida a aquest paisatge imaginat.']},
  {from:1150,title:'El temps dels comtes',captions:['La Torre Roja s’alça al costat del temple romànic. La comunitat creix al seu voltant.','L’emplaçament del palau comtal és discutit; el conjunt que veiem reconstrueix l’església.']},
  {from:1209,title:'Una vila franca',center:antoni,place:'La Vilanova',span:310,captions:['El 1209, Pere el Catòlic concedeix el privilegi de vila franca a la Vilanova.','És un pas en la seva autonomia, molts segles abans de la separació municipal.']},
  {from:1381,title:'Carrer de Barcelona',span:380,captions:['Vilamajor, Cardedeu i Santa Susanna són anomenats carrer de Barcelona.','Privilegis, obligacions i camins vinculen aquest món rural amb la ciutat.']},
  {from:1521,title:'La Vilanova pren forma',center:antoni,place:'La Vilanova',span:280,captions:['Els documents parroquials esmenten els habitants de la Vilanova.','El poblament s’estén al llarg del camí i entre les masies del terme.']},
  {from:1558,title:'Construir una nova església',span:190,captions:['El 1558 comencen les obres del nou temple de Sant Pere.','La nau canvia d’orientació. L’antic campanar es conserva, separat de la façana.']},
  {from:1600,title:'Can Gol: la torre dins el mas',center:[449038.97,4612958.823],place:'Can Gol de la Torre · Sant Antoni',span:58,angle:-.12,elevation:.43,approach:{span:112,angle:-.48,elevation:.68,center:[449031,4612954]},evidence:'Elements del XVI · 1600: llindar visual aproximat',captions:['A Can Gol, les cantoneres de l’antiga torre es llegeixen dins la masia.','Les finestres gòtiques i la teulada asimètrica evoquen el mas. La forma antiga del conjunt és interpretada.']},
  {from:1610,title:'La silueta de la Força',span:180,captions:['La nova església defineix la silueta de la Força: nau, contraforts i comunidor.','Al seu costat, la Torre Roja conserva la memòria de l’edifici medieval.']},
  {from:1697,title:'Les cases del carrer Vell',center:antoni,place:'La Vilanova',span:300,captions:['El 1697 es documenten 46 cases a la Vilanova, al llarg de l’antic camí comtal.','Les cases que veiem evoquen aquest poblament; la posició de cadascuna és interpretada.']},
  {from:1700,title:'Can Derrocada: un casal de poder',center:[449359.5,4614891.52],place:'Can Derrocada · Sant Pere',span:64,angle:.22,elevation:.55,approach:{span:98,angle:.48,elevation:.76},evidence:'Casal del XVII · Restitució aproximada · Annexos encara omesos',captions:['Documentat el 1220, Can Derrocada fou un centre de poder de la família Roig.','El casal que evoquem és del segle XVII: coberta a quatre vessants, portal de dovelles i xemeneia octogonal.']},
  {from:1776,title:'Una parròquia pròpia',center:antoni,place:'La Vilanova',span:380,captions:['La Vilanova obté una parròquia pròpia el 1776. El temple antic porta la data de 1789.','L’edifici actual de Sant Antoni encara no existeix: arribarà al segle XX.']},
  {from:1822,title:'El primer ajuntament',center:antoni,place:'La Vilanova',span:310,captions:['El 29 de desembre de 1822, 150 veïns es reuneixen per escollir els seus representants.','L’emancipació administrativa encara continuarà durant les dècades següents.']},
  {from:1843,title:'Un origen. Dos municipis.',center:[449620,4614320],place:'Sant Pere · Sant Antoni',span:1900,captions:['El 1843 culmina la segregació. Sant Pere i Sant Antoni inicien camins municipals propis.','A partir de 1850, el paisatge incorpora edificis segons les dates declarades al Cadastre.']},
  {from:1885,title:'Can Llinars: del mas a la granja',center:[448972.855,4615794.38],place:'Can Llinars · Can Sagarra',span:60,angle:.65,elevation:.48,approach:{span:104,angle:.9,elevation:.67},evidence:'Granja-Torre de Sagarra, 1885 · Ambientació interpretada',captions:['El 1885, Ferran de Sagarra instal·la a Can Llinars una indústria de productes làctics.','La planta baixa acull l’activitat; la família viu al pis noble. Les lleteres evoquen aquest nou ús del mas.']},
  {from:1910,title:'La casa de Gil Miret',center:[450148.67,4613518.59],place:'Casa Gil Miret · Sant Antoni',span:20,angle:2.267,elevation:1.3,evidence:'1910 · Manuel Joaquim Raspall · Restitució aproximada',captions:['El 1910, Manuel Joaquim Raspall projecta la casa d’estiueig de Gil Miret.','La forja corba, el trencadís i les llindes singulars vesteixen una façana estreta del carrer de França.']},
  {from:1912,title:'Ca l’Auferil: una torre d’estiueig',center:[450048.5,4613710],place:'Ca l’Auferil · Sant Antoni',span:52,angle:.956,evidence:'1911–1912 · Autor desconegut · Restitució aproximada',captions:['Ca l’Auferil es construeix entre 1911 i 1912. Encara no en coneixem l’arquitecte.','El groc de les façanes, els merlets i la ceràmica verda en fan una silueta singular.']},
  {from:1920,title:'Can Bertran: del mas a l’estiueig',center:[450190,4613430],place:'Can Bertran · Sant Antoni',span:95,angle:1.05,evidence:'Restitució aproximada · Reforma de 1910–1920 · Fonts a Patrimoni',captions:['Entre 1910 i 1920, una reforma atribuïda a Joan Rubió i Bellver transforma Can Bertran.','Els arcs de maó, les galeries i la torratxa donen una nova imatge a l’antic mas.']},
  {from:1930,title:'Les cases de la Força',center:[449128,4614886],place:'Can Cortès · La Dàlia · La Jardinera',span:85,angle:-.35,evidence:'Façanes d’inicis del XX · 1930: llindar visual aproximat',captions:['A la Força, les cases del conjunt de Can Cortès transformen la façana de migdia.','Balcons, coronaments i ornaments florals donen identitat a cada casa. La Jardinera serà ajuntament de 1940 a 1970.']},
  {from:1932,title:'La pedra torna a veure la llum',span:150,captions:['Les reformes de 1928–1932 retiren l’arrebossat de la Torre Roja.','El gres vermell torna a definir-ne l’aspecte.']},
  {from:1943,title:'Del camp als telers',center:antoni,place:'Sant Antoni de Vilamajor',span:420,captions:['El 1943, una fàbrica i un taller de cotó sumen 148 telers a Sant Antoni.','La indústria s’afegeix a una població d’arrels rurals.']},
  {from:1949,title:'La nova basílica',center:[450270.73,4613526.6],place:'Sant Antoni de Vilamajor',span:170,captions:['S’acaba el temple de Sebastià Bonet i Ayet: tres naus, absis i pòrtic de set arcs.','La façana s’obre a ponent-sud-oest, seguint l’orientació de l’edifici real.']},
];
export const tourShots:TourShot[]=history.map((s,i)=>({...s,to:history[i+1]?.from??1956,seconds:12,center:s.center??pere,place:s.place??'La Força · Sant Pere',span:s.span??230,angle:s.angle??(i%2?.35:-.55)}));
const intervals=[1956,1974,1982,1989,1996,2003,2010,2018,2026];
const captions=[
 ['El territori residencial s’estén més enllà dels dos nuclis. Sobrevolem Sant Julià d’Alfou.','Els volums apareixen segons l’any cadastral. La forma que representem és la seva empremta actual.'],
 ['A les Faldes del Montseny, les cases s’estenen entre el bosc i el pla.','El temps s’accelera: observa com es completa el teixit residencial.'],
 ['Les Pungoles forma un altre conjunt residencial del territori de Vilamajor.','La majoria dels volums són cases baixes: jardins, carrers i habitatges d’una o dues plantes.'],
 ['Ens desplacem cap a Can Miret. Els nuclis dispersos configuren un paisatge de baixa densitat.','Les dates cadastrals orienten aquesta seqüència; no documenten cada reforma ni cada enderroc.'],
 ['A llevant dels nuclis, Can Vila ocupa el paisatge dels Boscassos.','Continuem avançant pels anys. Els edificis ja construïts es mantenen mentre n’apareixen de nous.'],
 ['Can Ram s’estén al costat de Can Vila, en un terreny de pendents i carenes.','El relleu ens ajuda a seguir els pendents i la distribució dels edificis.'],
 ['Més al nord, Vallserena segueix les formes del relleu.','El vol recorre la urbanització mentre la cronologia continua avançant.'],
 ['Tornem a Can Derrocada, a tocar del nucli de Sant Pere.','El paisatge actual reuneix les dues viles, les urbanitzacions i els espais rurals compartits.'],
];
neighborhoods.forEach((p,i)=>tourShots.push({from:intervals[i],to:intervals[i+1],seconds:18,title:p.name,place:p.name,center:p.center,span:p.span,angle:i%2?-.5:.7,captions:captions[i]}));
tourShots.push({from:2026,to:2026,seconds:12,title:'Vilamajor, avui',place:'Sant Pere · Sant Antoni',center:[449500,4615400],span:12500,angle:0,captions:['Dos municipis. Un paisatge compartit. L’ortofotografia revela el territori actual.','Del Montseny a les viles i les urbanitzacions: Vilamajor, avui.']});
export const tourDuration=tourShots.reduce((sum,shot)=>sum+shot.seconds,0);
export const tourFinaleStart=tourDuration-tourShots.at(-1)!.seconds;
/** Eight seconds of eased reveal, then four seconds with the complete photograph. */
export function tourPhotoOpacity(seconds:number){
  const t=Math.max(0,Math.min(1,(seconds-tourFinaleStart)/8));
  return t*t*(3-2*t);
}
export function tourFrame(seconds:number){
  const elapsed=Math.max(0,Math.min(tourDuration,seconds));let start=0;
  for(let index=0;index<tourShots.length;index++){
    const shot=tourShots[index];if(elapsed<start+shot.seconds||index===tourShots.length-1){const progress=Math.min(1,(elapsed-start)/shot.seconds);return {shot,index,progress,year:shot.from+(shot.to-shot.from)*progress,caption:shot.captions[Math.min(shot.captions.length-1,Math.floor(progress*shot.captions.length))],elapsed};}start+=shot.seconds;
  }
  throw new Error('Empty tour');
}
export function tourTimeForYear(year:number){let start=0;for(const shot of tourShots){if(year<shot.to)return start+Math.max(0,(year-shot.from)/(shot.to-shot.from))*shot.seconds;start+=shot.seconds;}return tourDuration-tourShots.at(-1)!.seconds;}
export function chapterTime(index:number){return tourShots.slice(0,Math.max(0,index)).reduce((sum,s)=>sum+s.seconds,0);}

export interface TourCameraPose {center:[number,number];span:number;angle:number;elevation:number;targetHeight:number;}
/** Deterministic chapter choreography: establish the estate, approach, then hold the facade.
 * A stable close overview is the reduced-motion alternative. No frame-count integration. */
export function tourCameraPose(shot:TourShot,progress:number,reducedMotion=false):TourCameraPose{
 const end={center:shot.center,span:shot.span,angle:shot.angle,elevation:shot.elevation??.65,targetHeight:shot.approach?3:0};
 if(!shot.approach||reducedMotion)return end;
 const t=Math.max(0,Math.min(1,(progress-.24)/.62)),s=t*t*t*(t*(t*6-15)+10),start=shot.approach;
 if(t===1)return end;
 const origin=start.center??shot.center,center:[number,number]=[origin[0]+(end.center[0]-origin[0])*s,origin[1]+(end.center[1]-origin[1])*s];
 return {...end,center,span:start.span+(end.span-start.span)*s,angle:start.angle+(end.angle-start.angle)*s,elevation:start.elevation+(end.elevation-start.elevation)*s};
}
