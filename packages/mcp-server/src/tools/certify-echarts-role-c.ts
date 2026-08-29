export type EChartsRoleCUngradeableReason =
  | "MALFORMED_SVG"
  | "NO_CHART_ELEMENTS"
  | "NO_SOLID_CARRIER_PAINTS";

export interface EChartsRoleCPaintExtraction {
  readonly status: "ok" | "ungradeable";
  readonly roleCPaints: readonly string[];
  readonly chartElementCount: number;
  readonly unresolvedPaintCount: number;
  readonly reason?: EChartsRoleCUngradeableReason;
}

interface SvgStartElement {
  readonly attributes: ReadonlyMap<string, string>;
}

interface SvgParseResult {
  readonly malformed: boolean;
  readonly elements: readonly SvgStartElement[];
}

type ParsedPaint =
  | { readonly kind: "solid"; readonly value: string }
  | { readonly kind: "unresolved" }
  | { readonly kind: "ignored" };

// These option fields are renderer chrome, not data-carrier colors. ECharts can
// materialize a configured border as a tagged fill (treemap's structural tile
// paths), so filtering only SVG stroke attributes is insufficient.
const CHROME_COLOR_KEYS = new Set([
  "areacolor",
  "backgroundcolor",
  "bordercolor",
  "textbordercolor",
]);
const CHROME_SCAN_SKIP_KEYS = new Set([
  "__registration",
  "raw",
  "rawproperties",
  "usermeta",
]);

/**
 * Extract distinct visible Role-C carrier paints from normalized ECharts SVG.
 *
 * The parser walks XML start tags and quoted attributes. It never searches text
 * for tag-shaped strings, never treats element names as datum semantics, and
 * never deduplicates by ecmeta_data_index (node/edge indexes collide). Only an
 * exact ecmeta_ssr_type="chart" carrier participates; legend and untagged chrome
 * stay out. Paints retain first-rendered order and canonicalize to six-digit hex.
 *
 * Opacity is used only as a visibility gate. A visible solid source color is
 * retained when opacity is non-zero; no alpha-composited contrast is claimed.
 * Sankey's url() link gradients remain unresolved/excluded until a sampling and
 * compositing contract exists. If no solid carrier survives, the extraction is
 * ungradeable rather than an affirmative empty/pass result.
 */
export function extractEChartsRoleCPaints(
  svg: string,
  projectedOption: Readonly<Record<string, unknown>>,
): EChartsRoleCPaintExtraction {
  const parsed = parseSvgStartElements(svg);
  if (parsed.malformed) {
    return ungradeable("MALFORMED_SVG", 0, 0);
  }

  const chromePaints = collectOptionChromePaints(projectedOption);
  const roleCPaints = new Set<string>();
  let chartElementCount = 0;
  let unresolvedPaintCount = 0;

  for (const element of parsed.elements) {
    if (element.attributes.get("ecmeta_ssr_type") !== "chart") continue;
    chartElementCount += 1;

    if (isHidden(element.attributes)) continue;
    for (const channel of ["fill", "stroke"] as const) {
      if (!isChannelVisible(element.attributes, channel)) continue;
      const raw = element.attributes.get(channel);
      if (raw === undefined) continue;

      const paint = parseSolidPaint(raw);
      if (paint.kind === "unresolved") {
        unresolvedPaintCount += 1;
      } else if (paint.kind === "solid" && !chromePaints.has(paint.value)) {
        roleCPaints.add(paint.value);
      }
    }
  }

  if (chartElementCount === 0) {
    return ungradeable("NO_CHART_ELEMENTS", 0, unresolvedPaintCount);
  }
  if (roleCPaints.size === 0) {
    return ungradeable(
      "NO_SOLID_CARRIER_PAINTS",
      chartElementCount,
      unresolvedPaintCount,
    );
  }
  return {
    status: "ok",
    roleCPaints: [...roleCPaints],
    chartElementCount,
    unresolvedPaintCount,
  };
}

function ungradeable(
  reason: EChartsRoleCUngradeableReason,
  chartElementCount: number,
  unresolvedPaintCount: number,
): EChartsRoleCPaintExtraction {
  return {
    status: "ungradeable",
    roleCPaints: [],
    chartElementCount,
    unresolvedPaintCount,
    reason,
  };
}

function isHidden(attributes: ReadonlyMap<string, string>): boolean {
  const display = attributes.get("display")?.trim().toLowerCase();
  const visibility = attributes.get("visibility")?.trim().toLowerCase();
  return (
    display === "none" ||
    visibility === "hidden" ||
    visibility === "collapse" ||
    isZero(attributes.get("opacity"))
  );
}

function isChannelVisible(
  attributes: ReadonlyMap<string, string>,
  channel: "fill" | "stroke",
): boolean {
  if (isZero(attributes.get(`${channel}-opacity`))) return false;
  return channel !== "stroke" || !isZero(attributes.get("stroke-width"));
}

function isZero(value: string | undefined): boolean {
  if (value === undefined || value.trim() === "") return false;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed <= 0;
}

function parseSolidPaint(raw: string): ParsedPaint {
  const value = raw.trim();
  const lower = value.toLowerCase();
  if (value === "" || lower === "none" || lower === "transparent") {
    return { kind: "ignored" };
  }
  if (/^url\s*\(/i.test(value)) {
    return { kind: "unresolved" };
  }

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value)?.[1];
  if (hex) {
    const expanded =
      hex.length === 3
        ? hex
            .split("")
            .map((channel) => channel + channel)
            .join("")
        : hex;
    return { kind: "solid", value: `#${expanded.toUpperCase()}` };
  }

  const rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(
    value,
  );
  if (!rgb) return { kind: "ignored" };
  const channels = rgb.slice(1).map(Number);
  if (channels.some((channel) => channel < 0 || channel > 255)) {
    return { kind: "ignored" };
  }
  return {
    kind: "solid",
    value: `#${channels
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()}`,
  };
}

function collectOptionChromePaints(
  option: Readonly<Record<string, unknown>>,
): ReadonlySet<string> {
  const paints = new Set<string>();
  const pending: Array<{ readonly key?: string; readonly value: unknown }> = [
    { value: option },
  ];
  const visited = new Set<object>();

  while (pending.length > 0) {
    const current = pending.pop()!;
    const key = current.key?.toLowerCase();
    if (
      key &&
      CHROME_COLOR_KEYS.has(key) &&
      typeof current.value === "string"
    ) {
      const paint = parseSolidPaint(current.value);
      if (paint.kind === "solid") paints.add(paint.value);
    }

    if (
      current.value === null ||
      typeof current.value !== "object" ||
      visited.has(current.value)
    )
      continue;
    visited.add(current.value);
    if (Array.isArray(current.value)) {
      for (const child of current.value) pending.push({ value: child });
      continue;
    }
    for (const [childKey, child] of Object.entries(
      current.value as Record<string, unknown>,
    )) {
      if (!CHROME_SCAN_SKIP_KEYS.has(childKey.toLowerCase())) {
        pending.push({ key: childKey, value: child });
      }
    }
  }
  return paints;
}

function parseSvgStartElements(svg: string): SvgParseResult {
  const elements: SvgStartElement[] = [];
  const openTags: string[] = [];
  let cursor = 0;

  while (cursor < svg.length) {
    const tagStart = svg.indexOf("<", cursor);
    if (tagStart < 0) break;

    if (svg.startsWith("<!--", tagStart)) {
      const end = svg.indexOf("-->", tagStart + 4);
      if (end < 0) return { malformed: true, elements };
      cursor = end + 3;
      continue;
    }
    if (svg.startsWith("<![CDATA[", tagStart)) {
      const end = svg.indexOf("]]>", tagStart + 9);
      if (end < 0) return { malformed: true, elements };
      cursor = end + 3;
      continue;
    }
    if (svg.startsWith("<?", tagStart)) {
      const end = svg.indexOf("?>", tagStart + 2);
      if (end < 0) return { malformed: true, elements };
      cursor = end + 2;
      continue;
    }
    if (svg.startsWith("<!", tagStart)) {
      const end = svg.indexOf(">", tagStart + 2);
      if (end < 0) return { malformed: true, elements };
      cursor = end + 1;
      continue;
    }

    let index = tagStart + 1;
    const closing = svg[index] === "/";
    if (closing) index += 1;
    index = skipWhitespace(svg, index);
    const name = readXmlName(svg, index);
    if (!name) return { malformed: true, elements };
    index = name.end;

    if (closing) {
      index = skipWhitespace(svg, index);
      if (svg[index] !== ">" || openTags.pop() !== name.value.toLowerCase()) {
        return { malformed: true, elements };
      }
      cursor = index + 1;
      continue;
    }

    const attributes = new Map<string, string>();
    let selfClosing = false;
    let tagClosed = false;
    while (index < svg.length) {
      index = skipWhitespace(svg, index);
      if (svg[index] === ">") {
        index += 1;
        tagClosed = true;
        break;
      }
      if (svg[index] === "/" && svg[index + 1] === ">") {
        index += 2;
        selfClosing = true;
        tagClosed = true;
        break;
      }

      const attributeName = readXmlName(svg, index);
      if (!attributeName) return { malformed: true, elements };
      index = skipWhitespace(svg, attributeName.end);
      if (svg[index] !== "=") return { malformed: true, elements };
      index = skipWhitespace(svg, index + 1);
      const quote = svg[index];
      if (quote !== '"' && quote !== "'") return { malformed: true, elements };
      const valueStart = index + 1;
      const valueEnd = svg.indexOf(quote, valueStart);
      if (valueEnd < 0) return { malformed: true, elements };
      const normalizedName = attributeName.value.toLowerCase();
      if (attributes.has(normalizedName)) return { malformed: true, elements };
      attributes.set(normalizedName, svg.slice(valueStart, valueEnd));
      index = valueEnd + 1;
    }
    if (!tagClosed) return { malformed: true, elements };

    elements.push({ attributes });
    if (!selfClosing) openTags.push(name.value.toLowerCase());
    cursor = index;
  }

  return { malformed: openTags.length > 0, elements };
}

function skipWhitespace(value: string, start: number): number {
  let cursor = start;
  while (cursor < value.length && /\s/.test(value[cursor])) cursor += 1;
  return cursor;
}

function readXmlName(
  value: string,
  start: number,
): { readonly value: string; readonly end: number } | undefined {
  if (!/[A-Za-z_:]/.test(value[start] ?? "")) return undefined;
  let end = start + 1;
  while (end < value.length && /[A-Za-z0-9_.:-]/.test(value[end])) end += 1;
  return { value: value.slice(start, end), end };
}
