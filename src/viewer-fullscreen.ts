import {icon} from './icons';

/** Fullscreen exploration keeps the whole application interactive. */
export function createViewerFullscreen(root:HTMLElement,button:HTMLButtonElement){
  let active=false,native=false,pending=false;
  function paint(){
    root.classList.toggle('viewer-fullscreen',active);
    button.setAttribute('aria-pressed',String(active));
    button.setAttribute('aria-label',active?'Sortir de pantalla completa':'Pantalla completa');
    button.title=active?'Sortir de pantalla completa':'Obrir el visor a pantalla completa';
    button.innerHTML=icon(active?'minimize':'fullscreen');
  }
  function restore(){active=false;native=false;paint();button.focus({preventScroll:true});}
  async function exit(){
    if(document.fullscreenElement===root){
      try{await document.exitFullscreen();}catch{return;}
    }
    if(active)restore();
  }
  async function enter(){
    active=true;paint();
    // Keep the viewport-filling layout if the browser rejects or lacks the API.
    try{if(root.requestFullscreen)await root.requestFullscreen();}catch{}
    native=document.fullscreenElement===root;
    // Escape can cancel entry while the native request is still pending.
    if(!active){if(native)await document.exitFullscreen().catch(()=>{});return;}
    button.focus({preventScroll:true});
  }
  button.onclick=async()=>{
    if(pending)return;
    pending=true;
    try{if(active)await exit();else await enter();}finally{pending=false;}
  };
  document.addEventListener('fullscreenchange',()=>{
    if(!active)return;
    if(document.fullscreenElement===root)native=true;
    else if(native&&!document.fullscreenElement)restore();
  });
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape'||event.defaultPrevented||!active||root.querySelector('.documentary'))return;
    event.preventDefault();void exit();
  });
}
