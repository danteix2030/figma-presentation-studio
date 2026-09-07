import {describe,it,expect} from 'vitest';
import {sortFrames,FrameSchema} from '../packages/presentation-schema/src';
const frames=['Slide 10','01 - Title','Slide 2'].map((name,i)=>({id:String(i),name,x:i*100,y:0,width:100,height:100,order:i}));
describe('slide ordering',()=>{it('sorts numeric prefixes naturally',()=>expect(sortFrames(frames,'numeric').map(x=>x.name)).toEqual(['01 - Title','Slide 2','Slide 10']));it('does not mutate input',()=>{sortFrames(frames,'layers');expect(frames[0].name).toBe('Slide 10')});it('validates bridge metadata',()=>expect(FrameSchema.safeParse({...frames[0],width:-1}).success).toBe(false));});
