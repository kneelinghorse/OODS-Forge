import hashlib,json,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[4]
base='bb579fd8de9df1494c16e3e7b0f69ed1789f0518'
files=subprocess.check_output(['git','diff','--name-only',base,'HEAD','--','packages','scripts','tests'],cwd=root,text=True).splitlines()
output={'base':base,'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'builderSelfCertified':False,'files':[{'path':p,'sha256':hashlib.sha256((root/p).read_bytes()).hexdigest()} for p in files]}
(Path(__file__).parent/'source-identity.json').write_text(json.dumps(output,indent=2)+'\n')
print('Recorded',len(files),'changed source files')
