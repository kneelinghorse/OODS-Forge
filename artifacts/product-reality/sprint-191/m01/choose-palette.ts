import Color from 'colorjs.io';
import { readFileSync, writeFileSync } from 'node:fs';
import { evaluateCategoricalRoleA } from '../../../../packages/mcp-server/src/tools/certify-contrast.js';
import { contrastRatio } from '@oods/a11y-tools';
const source = JSON.parse(readFileSync('packages/tokens/src/viz-scales.json', 'utf8')).viz.scale.categorical;
const hex = (value: string) => '#' + new Color(value).to('srgb').coords.map(c => Math.round(Math.max(0, Math.min(1, c!)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const baseline = JSON.parse(readFileSync('artifacts/product-reality/sprint-191/m01/token-baseline.json', 'utf8'));
const canvases = Object.fromEntries(['A/light','B/light','A/dark','B/dark'].map(scope=>[scope,hex(baseline.maps[scope]['--oods-sys-surface-canvas'])]));
// Search downward at the source's four-decimal precision; hold chroma and hue fixed.
let lightL = 6558;
while (Object.entries(canvases).some(([scope,canvas])=>scope.endsWith('light') && contrastRatio(hex(`oklch(${lightL/10000} 0.122 80.37)`), canvas) < 3)) lightL--;
const light = Object.fromEntries(Object.entries(source).map(([k,v]: [string, any])=>[k,k==='04'?`oklch(${lightL/10000} 0.122 80.37)`:v.$value]));
// Keep each hue/chroma, brighten the dark palette, and retain lightness separation.
const dark = { ...Object.fromEntries(Object.entries(source).map(([k,v]: [string,any])=>[k,v.$value])), '01':'oklch(0.62 0.1737 264.97)', '02':'oklch(0.52 0.1875 274.17)', '03':'oklch(0.66 0.1195 161.58)', '04':'oklch(0.72 0.122 80.37)', '05':'oklch(0.64 0.1655 23.89)', '06':'oklch(0.55 0.1421 47.13)' };
const report = {canvases,light,dark, scopes:Object.entries(canvases).map(([scope,canvas])=>{const palette = Object.values(scope.endsWith('dark')?dark:light).map(hex);return {scope,canvas,slots:palette.map((paint,i)=>({slot:i+1,paint,ratio:contrastRatio(paint,canvas)})),roleA:evaluateCategoricalRoleA(palette)}})};
writeFileSync('artifacts/product-reality/sprint-191/m01/palette-selection.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
