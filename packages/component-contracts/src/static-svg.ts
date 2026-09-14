/** Preserve generated SVG bytes while admitting only passive, local SVG markup. */
export function assertStaticSvg(svg: string): string {
  const allowed = new Set(['svg', 'g', 'path', 'rect', 'text', 'tspan', 'line', 'polyline', 'polygon', 'circle', 'ellipse', 'defs', 'clippath', 'lineargradient', 'radialgradient', 'stop', 'title', 'desc', 'pattern', 'mask', 'use']);
  function unsafe(): never { throw new Error('Expected a self-contained static SVG without scripts or external references.'); }
  // ECharts SSR carries local hover paints in CDATA and font declarations on
  // text. Validate that bounded grammar without changing the renderer's bytes.
  const paint = /^(?:#[\da-f]{3,8}|rgba?\([\d.,%\s]+\)|Canvas|CanvasText|Highlight|HighlightText|none|transparent)$/i;
  const markup = svg.replace(/<style\s*>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/style>/g, (_, css: string) => {
    let remaining = css.trim();
    while (remaining) {
      const rule = /^\.oods-zr-\d+:hover\s*\{([^{}]*)\}/.exec(remaining);
      if (!rule) unsafe();
      const declarations = rule[1]!.split(';').map(value => value.trim()).filter(Boolean);
      if (!declarations.length) unsafe();
      for (const declaration of declarations) {
        const [name, value, extra] = declaration.split(':').map(part => part.trim());
        if (extra !== undefined || !value || !(
          (name === 'cursor' && value === 'pointer')
          || (name === 'pointer-events' && value === 'none')
          || (name === 'stroke-width' && /^\d+(?:\.\d+)?$/.test(value))
          || ((name === 'fill' || name === 'stroke') && paint.test(value))
        )) unsafe();
      }
      remaining = remaining.slice(rule[0].length).trim();
    }
    return '';
  });
  if (!/^<svg\b[^>]*>[\s\S]*<\/svg>\s*$/.test(markup) || /<!|<\?/i.test(markup)) unsafe();
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
  for (const match of markup.matchAll(/<\/?([\w:-]+)((?:[^<>"']|"[^"]*"|'[^']*')*)>/g)) {
    if (markup.slice(end, match.index).includes('<') || !allowed.has(match[1]!.toLowerCase())) unsafe();
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
      if (/(^|:)on/.test(name) || name === 'xml:base') unsafe();
      if (name === 'style') {
        if (!['text', 'tspan'].includes(match[1]!.toLowerCase())) unsafe();
        const declarations = value.split(';').map(part => part.trim()).filter(Boolean);
        if (!declarations.length || declarations.some(part => !/^(?:font-size:\d+(?:\.\d+)?px|font-family:(?:sans-serif|serif|monospace)|font-weight:(?:normal|bold|[1-9]00))$/.test(part))) unsafe();
      }
      if (/(^|:)href$/.test(name) && !/^#[\w:.-]+$/.test(value)) unsafe();
      if (['fill', 'stroke', 'filter', 'clip-path', 'mask', 'cursor'].includes(name) && /\\/.test(value)) unsafe();
      for (const url of value.matchAll(/url\s*\(([^)]*)\)/gi)) {
        if (!/^["']?#[\w:.-]+["']?$/.test(url[1]!.trim())) unsafe();
      }
    }
  }
  if (markup.slice(end).includes('<')) unsafe();
  return svg;
}
