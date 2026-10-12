import {defineConfig} from 'vite';
import {readFileSync} from 'node:fs';
export default defineConfig({
  base:'./',
  plugins:[{
    name:'distribution-notices',
    generateBundle(){
      for(const [source,fileName] of [['LICENSE','LICENSE'],['THIRD_PARTY_NOTICES.md','THIRD_PARTY_NOTICES.md'],['node_modules/three/LICENSE','THREE-LICENSE.txt']]){
        this.emitFile({type:'asset',fileName,source:readFileSync(new URL(source,import.meta.url),'utf8')});
      }
    },
  }],
  build:{rollupOptions:{output:{manualChunks(id){
    if(id.includes('/node_modules/three/build/'))return 'three';
  }}}},
});
