import fs from 'node:fs';
import path from 'node:path';
import {render} from '../../../../scripts/design-loop/render.js';
const base=path.resolve('artifacts/product-reality/sprint-191/m05');
for(const theme of ['light','dark']) for(const context of ['list','detail','workflow','workflow-detail']) {
 const input=JSON.parse(fs.readFileSync(`artifacts/product-reality/sprint-191/m01/inputs/${theme}-${context}.json`,'utf8'));
 input.output=path.join(base,'theme',theme,context);
 await render(input); console.log(theme,context,'captured');
}
