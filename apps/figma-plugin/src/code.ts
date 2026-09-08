import {z} from 'zod';
import {parseSlide,readMeta,META} from '../../../packages/figma-parser/src';
import {LayerMetaSchema,SlideMetaSchema} from '../../../packages/presentation-schema/src/model';
figma.showUI(__html__,{width:1180,height:760,themeColors:true,title:'figs.dec'});
const Command=z.discriminatedUnion('type',[z.object({type:z.literal('list'),requestId:z.string()}),z.object({type:z.literal('parse'),requestId:z.string(),id:z.string()}),z.object({type:z.literal('export-slide'),requestId:z.string(),id:z.string(),quality:z.number().min(.25).max(3).default(1)}),z.object({type:z.literal('select'),requestId:z.string(),id:z.string()}),z.object({type:z.literal('save-layer'),requestId:z.string(),id:z.string(),meta:LayerMetaSchema}),z.object({type:z.literal('save-slide'),requestId:z.string(),id:z.string(),meta:SlideMetaSchema}),z.object({type:z.literal('save-order'),requestId:z.string(),ids:z.string().array().max(2000)})]);
figma.ui.onmessage=async(raw:unknown)=>{const parsed=Command.safeParse(raw);if(!parsed.success)return;const msg=parsed.data;const send=(type:string,extra:Record<string,unknown>)=>figma.ui.postMessage({type,requestId:msg.requestId,...extra});try{let result:unknown;
if(msg.type==='list'){await figma.currentPage.loadAsync();result={title:figma.root.name,order:readMeta(figma.currentPage).order??[],frames:figma.currentPage.children.filter(n=>['FRAME','COMPONENT','INSTANCE'].includes(n.type)).map((n,order)=>({id:n.id,name:n.name,x:n.x,y:n.y,width:n.width,height:n.height,order}))};}
else if(msg.type==='save-order'){figma.currentPage.setPluginData(META,JSON.stringify({...readMeta(figma.currentPage),order:msg.ids}));result=true;}
else {const node=await figma.getNodeByIdAsync(msg.id);if(!node||!('visible'in node)||node.removed)throw new Error('Layer removida. Atualize os slides.');
if(msg.type==='parse')result=await parseSlide(node,s=>send('progress',{message:s}));
if(msg.type==='export-slide'){if(!('exportAsync'in node))throw new Error('Esta layer não pode ser exportada.');const bytes=await node.exportAsync({format:'PNG',constraint:{type:'SCALE',value:msg.quality}});result={name:node.name,width:node.width,height:node.height,bytes};}
if(msg.type==='select'){figma.currentPage.selection=[node];result=true;}
if(msg.type==='save-layer'||msg.type==='save-slide'){const value=JSON.stringify(msg.meta);if(value.length>45000)throw new Error('Configuração muito grande para salvar no documento.');node.setPluginData(META,value);figma.commitUndo();result=true;}}send('result',{result});
}catch(error){send('error',{message:error instanceof Error?error.message:'Falha na operação do Figma.'});}};
