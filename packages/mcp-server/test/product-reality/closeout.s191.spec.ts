import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { deriveRange, deriveMovers, S191_PUBLIC_RUNTIME_SCOPE } from '../../../../scripts/product-reality/s185-sprint-wide-movers.mjs';
import { auditSprintRange } from '../../../../scripts/product-reality/s185-audit-closeout.mjs';
import { allowedReviewEvidence, assertEvidenceOnlyHeadChanges } from '../../../../scripts/product-reality/s185-suite-accounting.mjs';
import { buildNotices } from '../../../../scripts/product-reality/s185-reconnect.mjs';
const root=new URL('../../../../',import.meta.url).pathname;
const read=(file:string)=>readFileSync(new URL(`../../../../${file}`,import.meta.url),'utf8');
describe('Sprint 191 bounded closeout',()=>{
  it('the advertised diff includes the maintenance executable boundary and component repairs',()=>{
    const range=deriveRange('d3a99d39','291ae9ba',root,S191_PUBLIC_RUNTIME_SCOPE);
    expect(range.publicPaths).toEqual(expect.arrayContaining(['scripts/runtime/assemble.mjs','packages/components-vue/src/primitives.ts','packages/mcp-server/src/errors/registry.ts']));
    const audit=auditSprintRange({root,base:range.base,head:range.head,sprintId:'sprint-191'});
    expect(audit.publicPaths).toEqual(range.publicPaths);
    const declaration={s191:{canonicalPaths:range.canonicalPaths,publicPaths:range.publicPaths}};
    const options={sprintId:'sprint-191',missionId:'s191-m05',base:'d3a99d39'};
    const movers=deriveMovers(range.head,declaration,root,options);
    const notices=buildNotices(movers,root);
    expect(notices).toMatchObject({sent:false,status:'prepared-unsent',targets:['cmos-dashboard','forge-demos','aquex-mcp']});
    expect(notices.notices.every((row:any)=>row.request.body.includes('scripts/runtime/assemble.mjs'))).toBe(true);
    declaration.s191.publicPaths=range.publicPaths.filter((file:string)=>file!=='scripts/runtime/assemble.mjs');
    expect(()=>deriveMovers(range.head,declaration,root,options)).toThrow('declared mover union differs');
  });
  it('review evidence cannot silently change implementation or historical proof',()=>{
    const file='artifacts/product-reality/sprint-191/m05/ci/observed.json';
    expect(allowedReviewEvidence(file,'sprint-191')).toBe(true);
    expect(()=>assertEvidenceOnlyHeadChanges([{status:'A',path:file}],'sprint-191')).not.toThrow();
    for(const row of [{status:'M',path:file},{status:'A',path:'scripts/runtime/new.mjs'},{status:'M',path:'artifacts/product-reality/sprint-191/m01/README.md'}]) expect(()=>assertEvidenceOnlyHeadChanges([row],'sprint-191')).toThrow();
  });
  it('current capability prose derives contrast from the registry and keeps review separate',()=>{
    const registry=JSON.parse(read('packages/viz-core/src/registry/viz-recipes.v1.json'));
    for(const filename of ['near.md','product-reality-program.md']) {
      const prose=read('cmos/foundational-docs/roadmap/'+filename);
      expect(prose).toContain(`contrastPassed light/dark for ${registry.filter((row:any)=>row.contrastPassed.length===2).length} categorical types, [] for ${registry.filter((row:any)=>row.contrastPassed.length===0).length} exempt`);
    }
    const near=read('cmos/foundational-docs/roadmap/near.md');
    for(const text of ['Increment 10 — Sprint 191: Carry-forward pay-down — BUILT, REVIEW PENDING','77/77 schemas and 154/154','6/6','builderSelfCertified:false','separateReviewRequired:true','`#1315` remains pending']) expect(near).toContain(text);
  });
});
