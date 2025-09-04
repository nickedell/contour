import { stageOf } from './stages';
export function sortMoments(a,b,stages){
  const sa = stageOf(a,stages)?.order ?? 0;
  const sb = stageOf(b,stages)?.order ?? 0;
  return sa===sb ? (a.column ?? 1) - (b.column ?? 1) : sa - sb;
}
