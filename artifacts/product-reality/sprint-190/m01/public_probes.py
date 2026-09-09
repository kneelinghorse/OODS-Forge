"""Public bridge calls only; retain request/response receipts before assertions."""
import json, urllib.request, urllib.error
from pathlib import Path
OUT=Path(__file__).resolve().parent

def call(name,tool,input):
 request={'tool':tool,'input':input,'role':'designer'}
 req=urllib.request.Request('http://127.0.0.1:4466/run',data=json.dumps(request).encode(),headers={'Content-Type':'application/json'})
 try:
  with urllib.request.urlopen(req,timeout=90) as response: status=response.status;body=json.load(response)
 except urllib.error.HTTPError as error: status=error.code;body=json.load(error)
 receipt={'request':request,'httpStatus':status,'response':body}
 (OUT/(name+'.json')).write_text(json.dumps(receipt,indent=2)+'\n')
 print(name,status,flush=True)
 assert status==200 and body['ok'],name
 return body['result']

if __name__=='__main__':
 workflow=call('call-01-workflow','design_compose',{'object':'Subscription','context':'workflow'})
 assert workflow['status']=='ok'
 schema=workflow['schema']
 print('Workflow keys',list(schema),'screen keys',[list(s) for s in schema['screens']],flush=True)
 for framework in ['react','vue']:
  generated=call('call-02-generate-'+framework,'code_generate',{'schema':schema,'framework':framework,'profile':'build'})
  assert generated['status']=='ok'
  print(framework,'result keys',list(generated),flush=True)
 catalog=call('call-03-catalog','catalog_list',{'detail':'full','pageSize':200})
 print('catalog keys',list(catalog),flush=True)
 listing=call('call-04-list','design_compose',{'object':'Subscription','context':'list'})
 assert listing['status']=='ok'
 loaded=call('call-05-saved-load','schema',{'action':'load','name':'user-form-showcase'})
 assert loaded['version']==2
