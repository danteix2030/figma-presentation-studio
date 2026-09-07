import {build} from 'esbuild';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const out='apps/figma-plugin/dist'; await mkdir(out,{recursive:true});
await build({entryPoints:['apps/figma-plugin/src/code.ts'],bundle:true,target:'es2017',outfile:out+'/code.js'});
const ui=await build({entryPoints:['apps/figma-plugin/src/main.tsx'],bundle:true,minify:true,write:false,outfile:'ui.js',define:{'process.env.NODE_ENV':'"production"'}});
const js=ui.outputFiles.find(f=>f.path.endsWith('.js')).text;const css=ui.outputFiles.find(f=>f.path.endsWith('.css'))?.text??'';
await writeFile(out+'/ui.html','<!doctype html><meta charset="utf-8"><style>'+css+'</style><div id="root"></div><script>'+js.replace(/<\/script/gi,'<\\/script')+'</script>');
console.log('Plugin built:',out);
