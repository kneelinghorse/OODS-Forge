import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { VIZ_PATTERN_SOURCES } from '@oods/viz-core';
import { handle as render } from '../../../../packages/mcp-server/src/tools/viz.render.js';
import { handle as certify } from '../../../../packages/mcp-server/src/tools/artifact.certify.js';
const out=resolve(process.argv[2]); mkdirSync(out,{recursive:true});
const results=[];
for(const source of VIZ_PATTERN_SOURCES){
 const response=await render({pattern:source.id,theme:'light',brand:'A',output:{svg:true,includeNormalizedSpec:true}});
 const grade=response.status==='ok'?await certify({spec:response.normalizedSpec!,theme:'light',brand:'A'}):undefined;
 const name=source.id.split(':').at(-1)!;
 writeFileSync(resolve(out,`${name}.json`),JSON.stringify({response,grade},null,2)+'\n');
 if(response.svg)writeFileSync(resolve(out,`${name}.svg`),response.svg);
 const summary={id:source.id,status:response.status,errors:response.errors,conformant:grade?.conformant,pillars:grade?.pillars,issues:grade?.issues,dimensions:response.render}; results.push(summary); console.log(JSON.stringify(summary));
}
writeFileSync(resolve(out,'summary.json'),JSON.stringify(results,null,2)+'\n');
