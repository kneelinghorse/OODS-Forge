import json,pathlib
r=pathlib.Path(__file__).resolve().parent
items=[
 ('1832-3-labels-help','Labels identify fields; descriptions are separate help text','Subscription','form','paragraph: Amount in USD'),
 ('1832-3-single-billing-controls','One billing amount and interval control; no duplicate raw field','Subscription','form','textbox "Billing amount"'),
 ('1832-3-single-reason','One Reason field in the embedded cancellation form','Subscription','form','textbox "Reason"'),
 ('1832-3-one-save','Save owns submission; no stray Change/Submit buttons','Subscription','form','button "Save"'),
 ('1881-7-preferences','Preference namespaces and structured document are seeded','Organization','form','combobox "Namespace"'),
 ('1881-7-roles','Canonical role catalog names and stable ID values','User','form','option "Owner"'),
 ('1881-7-templates','Canonical template and channel choices are seeded','Organization','form','option "Welcome Email"'),
 ('1881-7-plausible-values','Reserved domains, semantic versions and stable related-record IDs replace placeholders','Organization','form','cedar.example.com'),
 ('1915-2-contact-input','Billing contact name is an editable input rather than a field-label heading','Invoice','form','textbox "Billing contact name"'),
 ('1915-2-collection-state','Collection state is a single-line input','Invoice','form','textbox "Collection state"'),
 ('1915-2-identifier-width','The related subscription ID has a full-width input','Invoice','form','textbox "Subscription id"'),
 ('1915-2-issued-date','Invoice issued date uses the same September seed period as list/detail','Invoice','form','textbox "Issued at"'),
 ('1915-3-invoice-timeline','Invoice timeline presents its declared creation timestamp','Invoice','timeline','Created'),
 ('1915-3-plan-timeline','Plan timeline presents its declared period date as Period started','Plan','timeline','Period started'),
]
rows=[]
for id,meaning,obj,context,needle in items:
 refs=[]
 for framework in ['react','vue']:
  for width in [390,820,1440]:
   file=r/'after'/obj/framework/context/f'{width}.a11y.txt';lines=file.read_text().splitlines();line=next(i+1 for i,text in enumerate(lines) if needle in text)
   refs.append({'framework':framework,'width':width,'file':str(file.relative_to(r)),'line':line,'screenshot':str(file.with_suffix('').with_suffix('.png').relative_to(r))})
 rows.append({'item':id,'meaning':meaning,'object':obj,'receipts':refs})
for id,meaning,needle in [('1832-3-datetime-value','A seeded cancellation datetime fills the native datetime-local input','"type": "datetime-local"'),('1832-3-reason-code-parity','Both frameworks show the same stored cancellation reason code','"value": "customer_request"'),('1832-3-checkbox-placement','Checked checkbox and label centers align in both frameworks','"checkboxLabelCenterDelta": 0')]:
 refs=[]
 for framework in ['react','vue']:
  file=r/'after/Subscription/seeded-cancellation'/framework/'proof.json';line=next(i+1 for i,text in enumerate(file.read_text().splitlines()) if needle in text)
  refs.append({'framework':framework,'file':str(file.relative_to(r)),'line':line,'screenshots':[f'after/Subscription/seeded-cancellation/{framework}/{w}.png' for w in [390,820,1440]]})
 rows.append({'item':id,'meaning':meaning,'object':'Subscription/005','receipts':refs})
refs=[]
for obj in ['Organization','User','Subscription','Invoice','Plan']:
 for framework in ['react','vue']:
  file=r/'after'/obj/framework/'craft.json';line=next(i+1 for i,text in enumerate(file.read_text().splitlines()) if '"requiredMarks"' in text)
  refs.append({'object':obj,'framework':framework,'file':str(file.relative_to(r)),'line':line})
rows.append({'item':'1915-2-inline-required-marks','meaning':'Every visible required mark shares its label line at every captured width','receipts':refs})
(r/'item-mapping.json').write_text(json.dumps({'builderSelfCertified':False,'items':rows},indent=2)+'\n')
print(len(rows),'review items mapped')
