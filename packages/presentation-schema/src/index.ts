import { z } from 'zod';
export const FrameSchema = z.object({id:z.string(),name:z.string(),x:z.number(),y:z.number(),width:z.number().nonnegative(),height:z.number().nonnegative(),order:z.number()});
export type FrameInfo = z.infer<typeof FrameSchema>;
export type SortMode = 'visual'|'layers'|'name'|'numeric'|'manual';
export function sortFrames<T extends FrameInfo>(frames:T[],mode:SortMode):T[] {
 const number=(s:string)=>Number(s.match(/\d+/)?.[0]??Infinity);
 return [...frames].sort((a,b)=>mode==='visual'?a.y-b.y||a.x-b.x:mode==='layers'?b.order-a.order:mode==='name'?a.name.localeCompare(b.name):mode==='numeric'?number(a.name)-number(b.name)||a.name.localeCompare(b.name):0);
}
