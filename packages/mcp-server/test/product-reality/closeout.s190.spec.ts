import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateSprint190TimeoutRerun, allowedReviewEvidence, assertEvidenceOnlyHeadChanges } from '../../../../scripts/product-reality/s185-suite-accounting.mjs';
import { deriveRange, deriveMovers, S190_PUBLIC_RUNTIME_SCOPE } from '../../../../scripts/product-reality/s185-sprint-wide-movers.mjs';
import { auditSprint190SkippedIdentities } from '../../../../scripts/product-reality/s185-audit-closeout.mjs';
const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
const head='a'.repeat(40), file='packages/mcp-server/test/example.spec.ts';
const failure={file,testKey:'timeout example#0',executionId:'run-1',messages:['Error: Test timed out in 5000ms.']};
const report=JSON.stringify({success:true,numFailedTests:0,numPassedTests:1,testResults:[{assertionResults:[{status:'passed',fullName:'timeout example'}]}]});
const log='One isolated test passed.';
const rerun={executionHead:head,file,testKey:failure.testKey,attempts:1,exitCode:0,argv:['vitest','run','test/example.spec.ts','-t','timeout example'],rawReport:{path:'retry.json',sha256:hash(report)},log:{path:'retry.log',sha256:hash(log)}};
const readBytes=(name:string)=>Buffer.from(name==='retry.json'?report:log);

describe('bounded Sprint 190 closeout rules',()=>{
  it('accepts one matching isolated wall-clock retry, retaining the original failure',()=>{
    expect(validateSprint190TimeoutRerun({failures:[failure],rerun,readBytes,executionHead:head})).toMatchObject({decisionId:1833,originalFailureRetained:true});
  });
  it.each(['assertion','two failures','two retries','wrong test','changed report'])('rejects %s as timeout evidence',kind=>{
    const failures=structuredClone([failure]);const retry=structuredClone(rerun);
    if(kind==='assertion') failures[0]!.messages=['AssertionError: expected 1 to be 2'];
    if(kind==='two failures') failures.push({...failure});
    if(kind==='two retries') retry.attempts=2;
    if(kind==='wrong test') retry.testKey='another test#0';
    if(kind==='changed report') retry.rawReport.sha256='0'.repeat(64);
    expect(()=>validateSprint190TimeoutRerun({failures,rerun:retry,readBytes,executionHead:head})).toThrow();
  });
  it('the same 16 skipped identities in MCP and root remain 32 honest execution observations',()=>{
    const observations=(workspace:string)=>['viz-core','viz-render','mcp-server','root-core'].map(suite=>({
      suite,workspace,report:{numPendingTests:suite.includes('viz-')?0:16,testResults:[{
        name:`${workspace}/packages/mcp-server/test/e2e/stage1.spec.ts`,
        assertionResults:suite.includes('viz-')?[]:Array.from({length:16},(_,i)=>({fullName:`requires external fixture ${i}`,status:'skipped'})),
      }]},
    }));
    const baseline=observations('/historical'), current=observations('/current');
    expect(auditSprint190SkippedIdentities(current,baseline)).toMatchObject({uniqueIdentities:16,skippedExecutions:32});
    current[2]!.report.testResults[0]!.assertionResults[0]!.fullName='unrelated newly skipped assertion';
    expect(()=>auditSprint190SkippedIdentities(current,baseline)).toThrow('Skipped identities changed');
  });
  it('review descendants can add retained evidence, but cannot change source or earlier evidence',()=>{
    expect(allowedReviewEvidence('artifacts/product-reality/sprint-190/m06/ci/observed.json','sprint-190')).toBe(true);
    expect(()=>assertEvidenceOnlyHeadChanges([{status:'M',path:'artifacts/product-reality/sprint-190/m06/ci/observed.json'}],'sprint-190')).toThrow();
    expect(()=>assertEvidenceOnlyHeadChanges([{status:'A',path:'packages/viz-core/src/new-runtime.ts'}],'sprint-190')).toThrow();
  });
  it('the sprint-wide scope catches token exports, scoped certification and placement',()=>{
    const root=new URL('../../../../',import.meta.url).pathname;
    const range=deriveRange('c3a68d5f','cd2a75a1',root,S190_PUBLIC_RUNTIME_SCOPE);
    expect(range.publicPaths).toEqual(expect.arrayContaining(['packages/tokens/scripts/build-entry.mjs','packages/viz-core/src/index.ts','packages/mcp-server/src/tools/artifact.certify.ts']));
    const declaration={s190:{canonicalPaths:range.canonicalPaths,publicPaths:range.publicPaths}};
    expect(deriveMovers('cd2a75a1',declaration,root,{sprintId:'sprint-190',missionId:'s190-m06',base:'c3a68d5f'}).status).toBe('passed');
    declaration.s190.publicPaths=declaration.s190.publicPaths.filter((path:string)=>path!=='packages/tokens/scripts/build-entry.mjs');
    expect(()=>deriveMovers('cd2a75a1',declaration,root,{sprintId:'sprint-190',missionId:'s190-m06',base:'c3a68d5f'})).toThrow();
  });
  it('roadmap capability rows use the same registry counts and carry the certified-and-closed status',()=>{
    const read=(file:string)=>readFileSync(new URL(`../../../../${file}`,import.meta.url),'utf8');
    const registry=JSON.parse(read('packages/viz-core/src/registry/viz-recipes.v1.json'));
    const near=read('cmos/foundational-docs/roadmap/near.md'),program=read('cmos/foundational-docs/roadmap/product-reality-program.md');
    for(const prose of [near,program]) expect(prose).toContain(`${registry.filter((row:any)=>row.publicSvg).length}/13 public SVG`);
    expect(program).toContain(`${registry.filter((row:any)=>row.dashboardDrawn===true).length}/11 admitted types drawn`);
    expect(near).toContain('## Increment 9 — Sprint 190: Visualization public render — CERTIFIED AND CLOSED');
    expect(near).not.toContain('Visualization public render — BUILT, REVIEW PENDING');
    expect(near).toContain('Sprint 190 is **Completed**, independently certified by review `PS-2026-09-10-001` and decision `#1859`.');
  });
});
