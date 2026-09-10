/** Preserve generated SVG bytes while admitting only passive, local SVG markup. */
export function assertStaticSvg(svg: string): string {
  const allowed = new Set(['svg', 'g', 'path', 'rect', 'text', 'tspan', 'line', 'polyline', 'polygon', 'circle', 'ellipse', 'defs', 'clippath', 'lineargradient', 'radialgradient', 'stop', 'title', 'desc', 'pattern', 'mask', 'use']);
  function unsafe(): never { throw new Error('Expected a self-contained static SVG without scripts or external references.'); }
  if (!/^<svg\b[^>]*>[\s\S]*<\/svg>\s*$/.test(svg) || /<!|<\?/i.test(svg)) unsafe();
  const decode = (value: string): string => value.replace(/&([^;]+);/g, (_, entity: string) => {
    const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
    if (named[entity]) return named[entity]!;
    if (/^#(?:x[0-9a-f]+|[0-9]+)$/i.test(entity)) {
      const code = entity[1]!.toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
      if (code > 0 && code <= 0x10ffff) return String.fromCodePoint(code);
    }
    return unsafe();
  });
  let end = 0;
  for (const match of svg.matchAll(/<\/?([\w:-]+)((?:[^<>"']|"[^"]*"|'[^']*')*)>/g)) {
    if (svg.slice(end, match.index).includes('<') || !allowed.has(match[1]!.toLowerCase())) unsafe();
    end = match.index! + match[0].length;
    const attributes = match[2]!.replace(/\/\s*$/, '');
    const attribute = /\s+([\w:-]+)\s*=\s*("[^"]*"|'[^']*')/y;
    let offset = 0;
    while (offset < attributes.trimEnd().length) {
      attribute.lastIndex = offset;
      const found = attribute.exec(attributes);
      if (!found) unsafe();
      offset = attribute.lastIndex;
      const name = found[1]!.toLowerCase();
      const value = decode(found[2]!.slice(1, -1));
      if (/(^|:)on/.test(name) || name === 'xml:base' || name === 'style') unsafe();
      if (/(^|:)href$/.test(name) && !/^#[\w:.-]+$/.test(value)) unsafe();
      if (['fill', 'stroke', 'filter', 'clip-path', 'mask', 'cursor'].includes(name) && /\\/.test(value)) unsafe();
      for (const url of value.matchAll(/url\s*\(([^)]*)\)/gi)) {
        if (!/^["']?#[\w:.-]+["']?$/.test(url[1]!.trim())) unsafe();
      }
    }
  }
  if (svg.slice(end).includes('<')) unsafe();
  return svg;
}
