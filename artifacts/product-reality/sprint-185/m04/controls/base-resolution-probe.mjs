import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const base=fs.realpathSync(process.cwd()); const require=createRequire(path.join(base,'packages/mcp-server/dist/tools/code.generate.js'));
const specs=['@oods/component-contracts','@oods/component-contracts/registry/capabilities','@oods/components-react','@oods/components-react/ported','@oods/components-react/readiness','@oods/components-react/readiness-ported','@oods/components-vue','@oods/components-vue/ported','@oods/components-vue/readiness','@oods/components-vue/readiness-ported','@oods/viz-core','@oods/viz-render','@oods/artifacts','@oods/a11y-tools','@oods/release-utils'];
const rows=specs.map(specifier=>{ const resolved=fs.realpathSync(require.resolve(specifier)); if(!resolved.startsWith(base+path.sep)) throw Error('Non-base resolution: '+specifier+' => '+resolved); return {specifier,resolved}; });
for(const target of ['react','vue']) { const manifest=require('@oods/components-'+target+'/readiness'); if(manifest.rows.length!==14) throw Error('Base nucleus is not fourteen'); }
console.log(JSON.stringify({base,rows,baseNucleusRows:14,allResolutionsWithinBase:true},null,2));
