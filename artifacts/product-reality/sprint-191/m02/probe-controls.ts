import { launchProofBrowser } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
import { observeCollectionControls } from '../../../../scripts/product-reality/s188-m03-app-consumers.js';
const browser=await launchProofBrowser();
try{for(const port of [4478,4479]){const page=await browser.newPage();console.log(port,await observeCollectionControls(page,`http://127.0.0.1:${port}`,'Organization'));await page.close();}}finally{await browser.close();}
