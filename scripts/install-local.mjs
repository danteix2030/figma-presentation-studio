import {readFile,writeFile,copyFile} from 'node:fs/promises';
import path from 'node:path';
const target=process.argv[2]; if(!target) throw new Error('Pass the Figma-created plugin directory.');
const existing=JSON.parse(await readFile(path.join(target,'manifest.json'),'utf8')); const manifest=JSON.parse(await readFile('apps/figma-plugin/manifest.json','utf8'));
if(existing.id!==manifest.id) throw new Error('Plugin ID mismatch: refusing to overwrite a different plugin.');
manifest.main='code.js';manifest.ui='ui.html';await copyFile('apps/figma-plugin/dist/code.js',path.join(target,'code.js'));await copyFile('apps/figma-plugin/dist/ui.html',path.join(target,'ui.html'));await writeFile(path.join(target,'manifest.json'),JSON.stringify(manifest,null,2));console.log('Installed compiled plugin:',target);
