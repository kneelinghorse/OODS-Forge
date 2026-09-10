import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import bundle from '../../../../packages/tokens/dist/index.cjs';
import { resolveCategoricalPalette, resolveTokenToColor } from '@oods/viz-core';
import { toHex } from '../../../../packages/viz-core/src/tokens/categorical-palette.js';
import { contrastRatio } from '@oods/a11y-tools';
import { evaluateCategoricalRoleA } from '../../../../packages/mcp-server/src/tools/certify-contrast.js';
const before = JSON.parse(fs.readFileSync(new URL('./token-baseline.json',import.meta.url),'utf8'));
const hash = (x: unknown) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const maps = {flat:bundle.cssVariables,...Object.fromEntries(Object.entries(bundle.cssVariablesByScope).flatMap(([b,themes])=>Object.entries(themes).map(([t,v])=>[`${b}/${t}`,v])))};
const comparisons=Object.entries(maps).map(([scope,values])=>{
 const changes=Object.keys(values).filter(k=>values[k]!==before.maps[scope][k]);
 const expected=scope.endsWith('dark')?Array.from({length:6},(_,i)=>`--oods-viz-scale-categorical-0${i+1}`):scope.endsWith('hc')?[]:['--oods-viz-scale-categorical-04'];
 assert.deepEqual([...changes].sort(),expected.sort(),scope);
 return {scope,before:before.hashes[scope],after:hash(values),changes};
});
const ratios=[];
for(const brand of ['A','B'] as const)for(const theme of ['light','dark'] as const){
 const scope={brand,theme},palette=resolveCategoricalPalette({} as never,scope),canvas=toHex(resolveTokenToColor('--sys-surface-canvas',scope)!)!;
 const slots=palette.map((paint,i)=>({slot:i+1,paint,ratio:contrastRatio(paint,canvas)}));
 const roleA=evaluateCategoricalRoleA(palette);
 assert(slots.every(s=>s.ratio>=3));assert.equal(roleA.verdict,'pass');
 ratios.push({scope:`${brand}/${theme}`,canvas,slots,roleA});
}
fs.writeFileSync(new URL('./token-proof.json',import.meta.url),JSON.stringify({comparisons,ratios},null,2)+'\n');
console.log(JSON.stringify({maps:comparisons.length,roleC:24,roleA:4,hcUnchanged:true}));
