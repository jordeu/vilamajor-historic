/** Non-modal contextual panels: one open at a time, with a predictable focus return. */
export function createPanels(){
  let panel:HTMLElement|null=null,opener:HTMLElement|null=null;
  function close(restore=true){
    if(!panel)return;
    panel.hidden=true;opener?.setAttribute('aria-expanded','false');
    const previous=opener;panel=null;opener=null;
    if(restore&&previous?.isConnected)previous.focus({preventScroll:true});
  }
  function open(id:string,trigger:HTMLElement|null,focus=true){
    close(false);panel=document.getElementById(id)!;opener=trigger;
    const title=panel.querySelector(':scope > h2'),dismiss=panel.querySelector(':scope > [data-close-panel]');
    if(title&&dismiss){const heading=document.createElement('div');heading.className='panel-heading';heading.append(title,dismiss);panel.prepend(heading);title.id=id+'-title';panel.setAttribute('aria-labelledby',title.id);}
    panel.hidden=false;opener?.setAttribute('aria-expanded','true');
    if(focus)(panel.querySelector<HTMLElement>('[data-initial-focus]')??panel.querySelector<HTMLElement>('[data-close-panel], button, input, select, a[href]')??panel).focus({preventScroll:true});
  }
  document.addEventListener('click',event=>{if((event.target as Element).closest('[data-close-panel]'))close();});
  document.addEventListener('pointerdown',event=>{
    const target=event.target as Node;
    if(panel&&!panel.contains(target)&&!opener?.contains(target))close(false);
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel){event.preventDefault();close();}});
  return {open,close,get active(){return panel?.id??null;},toggle(id:string,trigger:HTMLElement){panel?.id===id?close():open(id,trigger);},closeIf(id:string,restore=false){if(panel?.id===id)close(restore);}};
}
