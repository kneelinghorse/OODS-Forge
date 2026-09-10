from pathlib import Path
import subprocess, json, hashlib, re
base=Path('artifacts/product-reality/sprint-191/m04')
source=Path('packages/mcp-server/src/lib/dtcg-intake/index.ts')
original=source.read_bytes()
digest=lambda data: hashlib.sha256(data).hexdigest()
for bite,selector,old,new,expected in [
 ('B-04','reconciles all|B-04','submitted_token_instance_denominator: denominator(submittedMembership),','submitted_token_instance_denominator: denominator(submittedMembership.slice(1)),',2),
 ('B-05','B-05','not_accepted_token_reason_denominator: denominator(reasonMembership),','not_accepted_token_reason_denominator: denominator(reasonMembership.map((reason, index) => index === 0 ? { ...reason, reason: "" } : reason)),',1),
]:
 out=base/bite;out.mkdir(parents=True,exist_ok=True)
 command=['pnpm','--filter','@oods/mcp-server','exec','vitest','run','test/contracts/dtcg-intake.s180.spec.ts','-t',selector]
 sequence=[]
 try:
  for phase,mutated in [('pre-green',False),('selected-red',True),('restored-green',False)]:
   text=original.decode();assert text.count(old)==1
   source.write_bytes(text.replace(old,new).encode() if mutated else original)
   if mutated:(out/'mutation.patch').write_bytes(subprocess.check_output(['git','diff','--',str(source)]))
   result=subprocess.run(command,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
   (out/(phase+'.log')).write_bytes(result.stdout)
   clean=re.sub(r'\x1b\[[0-9;]*m','',result.stdout.decode())
   summary=next(line.strip() for line in clean.splitlines() if re.match(r'\s*Tests\s+\d',line))
   assert result.returncode==(1 if mutated else 0),(bite,phase,summary)
   assert f'{expected} {"failed" if mutated else "passed"}' in summary,summary
   assert '(21)' in summary,summary
   assert f'{21-expected} skipped' in summary,summary
   sequence.append({'phase':phase,'exitCode':result.returncode,'selected':expected,'runnerFiltered':21-expected,'selectedSkipped':0,'total':21,'summary':summary,'sourceSha256':digest(source.read_bytes()),'logSha256':digest(result.stdout)})
 finally:source.write_bytes(original)
 assert source.read_bytes()==original
 (out/'receipt.json').write_text(json.dumps({'bite':bite,'command':command,'source':str(source),'sourceSha256':digest(original),'restoredSha256':digest(source.read_bytes()),'sequence':sequence,'patchSha256':digest((out/'mutation.patch').read_bytes())},indent=2)+'\n')
 print(bite,[(row['phase'],row['summary']) for row in sequence],flush=True)
