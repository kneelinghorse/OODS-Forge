"""Read-only delivery observation; never persists process environment values."""
import datetime, hashlib, json, subprocess, sys, urllib.request
from pathlib import Path
ROOT=Path('/Users/systemsystems/portfolio/Design-Tools/OODS-Forge')
OUT=Path(__file__).resolve().parent

def run(*args):
    return subprocess.check_output(args,cwd=ROOT,text=True)

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def hashes(directory):
    return {str(p.relative_to(directory)):sha(p) for p in sorted(directory.rglob('*')) if p.is_file()}

def observe(name):
    processes=json.loads(run('pm2','jlist'))
    proc=next(p for p in processes if p['name']=='oods-forge-bridge')
    env=proc['pm2_env']
    receipt={'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'head':run('git','rev-parse','HEAD').strip(),'porcelain':run('git','status','--porcelain'),
        'pm2':{'name':proc['name'],'pid':proc['pid'],'cwd':env['pm_cwd'],'script':env['pm_exec_path'],
            'restartCount':env['restart_time'],'status':env['status'],'envKeyNames':sorted(env.get('env',{}))},
        'listener':run('lsof','-nP','-iTCP:4466','-sTCP:LISTEN'),
        'health':json.load(urllib.request.urlopen('http://127.0.0.1:4466/health')),
        'store':hashes(ROOT/'packages/mcp-server/.oods/schemas'),
        'builtFiles':{str(p.relative_to(ROOT)):sha(p) for package in ['mcp-server','mcp-bridge']
            for p in sorted((ROOT/f'packages/{package}/dist').rglob('*')) if p.is_file()}}
    (OUT/name).write_text(json.dumps(receipt,indent=2)+'\n')
    return receipt

if __name__=='__main__':
    r=observe(sys.argv[1]); print(json.dumps({k:r[k] for k in ['observedAt','head','porcelain','listener','health']},indent=2))
    print('PID',r['pm2']['pid'],'store files',len(r['store']),'compiled files',len(r['builtFiles']))
