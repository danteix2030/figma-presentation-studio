import {z} from 'zod';
export const AnimationSchema=z.object({id:z.string(),effect:z.enum(['fade','fade-up','fade-down','fade-left','fade-right','zoom','pop','rotate','flip','blur','wipe','bounce','pulse','shake']),trigger:z.enum(['enter','with-previous','after-previous','click','hover','layer-click','manual','auto']).default('enter'),phase:z.enum(['entrance','exit','emphasis']).default('entrance'),duration:z.number().min(1).max(60000),delay:z.number().min(0).max(600000),easing:z.string().max(150).default('ease-out'),distance:z.number().default(48)});
export type Motion=z.infer<typeof AnimationSchema>;
export const LayerMetaSchema=z.object({animations:AnimationSchema.array().max(100).default([]),url:z.string().max(4096).default(''),targetSlide:z.string().default(''),video:z.string().max(4096).default(''),muted:z.boolean().default(true),loop:z.boolean().default(false),autoplay:z.boolean().default(false)});
export type LayerMeta=z.infer<typeof LayerMetaSchema>;
export const SlideMetaSchema=z.object({notes:z.string().max(20000).default(''),status:z.enum(['Draft','Reviewing','Approved','Needs Changes']).default('Draft'),transition:z.enum(['none','fade','slide','zoom','blur','flip']).default('fade'),duration:z.number().min(0).max(10000).default(500)});
export type SlideMeta=z.infer<typeof SlideMetaSchema>;
export type Layer={id:string;name:string;type:string;x:number;y:number;width:number;height:number;rotation:number;opacity:number;fill:string;radius:number;text?:string;fontSize?:number;fontFamily?:string;fontWeight?:number;align?:string;asset?:string;children:Layer[];meta:LayerMeta;};
export type Slide={id:string;name:string;width:number;height:number;background:string;thumbnail:string;layers:Layer[];meta:SlideMeta;warnings:string[]};
export type Presentation={version:1;id:string;title:string;slides:Slide[]};
export const defaultLayerMeta=():LayerMeta=>LayerMetaSchema.parse({});
export const defaultSlideMeta=():SlideMeta=>SlideMetaSchema.parse({});
export function flatten(layers:Layer[]):Layer[]{return layers.flatMap(l=>[l,...flatten(l.children)]);}
export function safeLink(value:string):string {try{const u=new URL(value);return ['https:','http:','mailto:','tel:'].includes(u.protocol)?u.href:'';}catch{return '';}}
