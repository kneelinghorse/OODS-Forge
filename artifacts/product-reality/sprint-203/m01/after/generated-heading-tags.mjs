import { handle as compose } from '/Users/systemsystems/.codex/worktrees/s203/OODS-Forge/packages/mcp-server/dist/tools/design.compose.js';
import { handle as generate } from '/Users/systemsystems/.codex/worktrees/s203/OODS-Forge/packages/mcp-server/dist/tools/code.generate.js';
const cases = [['Article','card'],['Subscription','detail'],['Organization','detail'],['Product','form'],['Subscription','timeline'],['Organization','card'],['User','list']];
let any = false;
for (const [object, context] of cases) for (const framework of ['react','vue']) {
  const c = await compose({ intent: `${context} for ${object}`, object, context });
  const g = await generate({ schemaRef: c.schemaRef, framework });
  // Real heading tags only: JSX/template elements, not "h3" inside SVG path data.
  const tags = (g.code.match(/<\/?h[1-6][\s>/]/g) || []);
  if (tags.length) { any = true; console.log(`${object}/${context}/${framework}: ${tags.join(' ')}`); }
}
console.log(any ? 'HEADINGS PRESENT IN GENERATED CODE' : 'no heading tag appears in any generated artifact: the heading level lives entirely in the component packages');
