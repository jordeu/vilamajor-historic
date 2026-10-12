import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const directory=new URL('../public/data/',import.meta.url),entries=[];
for(const file of (await readdir(directory)).sort()){
 if(file==='checksums.json'||file.endsWith('.tmp'))continue;
 const data=await readFile(new URL(file,directory));entries.push({file,bytes:data.byteLength,sha256:createHash('sha256').update(data).digest('hex')});
}
await writeFile(new URL('checksums.json',directory),JSON.stringify(entries));
console.log(`Checksums for ${entries.length} data assets`);
