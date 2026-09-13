import { handle as compose } from '../../../../packages/mcp-server/src/tools/design.compose.js';
import { handle as generate } from '../../../../packages/mcp-server/src/tools/code.generate.js';
for (const object of ['Invoice', 'Usage']) {
 const { schema } = await compose({object,context:'detail'});
 const result = await generate({schema,framework:'html',profile:'build'});
 console.log(JSON.stringify({object,status:result.status,warnings:result.warnings,errors:result.errors,validationReceipt:result.validationReceipt}));
}
