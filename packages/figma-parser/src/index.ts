import {LayerMetaSchema,SlideMetaSchema,defaultLayerMeta,defaultSlideMeta,type Layer,type Slide} from '../../presentation-schema/src/model';
export const META='presentation_studio_v1';
export function readMeta(node:BaseNode){try{return JSON.parse(node.getPluginData(META)||'{}');}catch{return {};}}
function color(paints:readonly Paint[]|PluginAPI['mixed']|undefined,fallback='transparent'):string{if(!paints||typeof paints==='symbol')return fallback;const p=paints.find(p=>p.visible!==false&&p.type==='SOLID') as SolidPaint|undefined;return p?'#'+[p.color.r,p.color.g,p.color.b].map(c=>Math.round(c*255).toString(16).padStart(2,'0')).join(''):fallback;}
export async function parseSlide(node:SceneNode,progress:(s:string)=>void):Promise<Slide>{
const warnings:string[]=[];let count=0;
async function parse(n:SceneNode):Promise<Layer>{
 if(++count%20===0){progress('Lendo layer '+count);await new Promise(r=>setTimeout(r,0));}
 const raw=LayerMetaSchema.safeParse(readMeta(n));const layer:Layer={id:n.id,name:n.name,type:n.type,x:n.x,y:n.y,width:n.width,height:n.height,rotation:'rotation'in n?-n.rotation:0,opacity:'opacity'in n?n.opacity:1,fill:color('fills'in n?n.fills:undefined),radius:'cornerRadius'in n&&typeof n.cornerRadius==='number'?n.cornerRadius:0,meta:raw.success?raw.data:defaultLayerMeta(),children:[]};
 if(n.type==='TEXT'){layer.text=n.characters;layer.fontSize=typeof n.fontSize==='number'?n.fontSize:16;layer.fontFamily=typeof n.fontName==='object'?n.fontName.family:'Arial';layer.fontWeight=typeof n.fontWeight==='number'?n.fontWeight:400;layer.align=n.textAlignHorizontal.toLowerCase();if(n.hasMissingFont)warnings.push('Fonte ausente: '+n.name);if(typeof n.fontSize==='symbol')warnings.push('Texto com estilos mistos: '+n.name);}
 const kids='children'in n?n.children.filter(c=>c.visible):[];const complex=kids.some(c=>'isMask'in c&&c.isMask)||('effects'in n&&n.effects.some(e=>e.visible&&e.type==='LAYER_BLUR'));
 if(kids.length&&!complex){for(const c of kids)layer.children.push(await parse(c));}
 else if('exportAsync'in n){try{const vector=['VECTOR','BOOLEAN_OPERATION','STAR','POLYGON','ELLIPSE','LINE'].includes(n.type)&&!complex;const bytes=vector?await n.exportAsync({format:'SVG'}):await n.exportAsync({format:'PNG',constraint:{type:'SCALE',value:Math.min(2,2048/Math.max(n.width,n.height,1))}});layer.asset=(vector?'data:image/svg+xml;base64,':'data:image/png;base64,')+figma.base64Encode(bytes);if(complex)warnings.push('Grupo com máscara/blur rasterizado: '+n.name);}catch{warnings.push('Falha ao renderizar layer: '+n.name);}}
 return layer;
}
const layers:Layer[]=[];if('children'in node)for(const c of node.children)if(c.visible)layers.push(await parse(c));
let thumbnail='';if('exportAsync'in node){thumbnail='data:image/png;base64,'+figma.base64Encode(await node.exportAsync({format:'PNG',constraint:{type:'WIDTH',value:320}}));}
const m=SlideMetaSchema.safeParse(readMeta(node));return{id:node.id,name:node.name,width:node.width,height:node.height,background:color('fills'in node?node.fills:undefined,'#ffffff'),thumbnail,layers,meta:m.success?m.data:defaultSlideMeta(),warnings};
}
