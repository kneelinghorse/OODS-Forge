import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const W = process.argv[2];
const { handle } = await import(pathToFileURL(path.join(W, 'packages/mcp-server/dist/tools/code.generate.js')).href);
const store = path.join(W, 'artifacts/product-reality/sprint-183/m04/saved-schema-store');
const FIVE = new Set(['DetailHeader','CardHeader','ColorSwatch','ColorizedBadge','VizAreaPreview']);
const targets = ['cmos-messages-redesign','plan-form-dark','pt-shop-parts-entry-router-v1','user-card-showcase','cmos-dashboard-redesign','the-academy-landing-v1'];
function prune(n){ if(Array.isArray(n)) return n.filter(x=>!(x&&typeof x==='object'&&FIVE.has(x.component))).map(prune); if(n&&typeof n==='object'){const o={}; for(const k of Object.keys(n)) o[k]=prune(n[k]); return o;} return n; }
function collect(res){ const out=[]; for (const k of ['issues','errors','warnings','diagnostics']) if (Array.isArray(res?.[k])) for (const i of res[k]) out.push({...i, _k:k}); if (res?.validation) for (const k of ['issues','errors','warnings']) if (Array.isArray(res.validation[k])) for (const i of res.validation[k]) out.push({...i,_k:'validation.'+k}); return out; }
let shown=false;
for (const t of targets) {
  const record = JSON.parse(fs.readFileSync(path.join(store, t + '.json'), 'utf8'));
  for (const framework of ['react','vue']) {
    for (const [tag, schema] of [['full', record.schema], ['pruned', prune(record.schema)]]) {
      const res = await handle({ framework, profile: 'build', schema });
      if (!shown) { console.log('RESPONSE KEYS:', Object.keys(res).join(',')); if(res.validation) console.log('validation keys:', Object.keys(res.validation).join(',')); shown=true; }
      const all = collect(res);
      const byCode = {}; for (const i of all) { const k=i.code||'?'; byCode[k]=(byCode[k]||0)+1; }
      console.log(`${t}/${framework}/${tag}: status=${res.status} artifact=${res.artifact?'yes':'no'} ${JSON.stringify(byCode)}`);
      for (const i of all.filter(i=>i.code!=='OODS-N015').slice(0,5)) console.log('     ', i.code, i._k, (i.nodeId??i.path??i.componentId??''), '-', String(i.message).slice(0,160));
    }
  }
}
