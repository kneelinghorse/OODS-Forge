import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("Sprint 177 standing-rule canon", () => {
  const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
  const documentPath = resolve(
    projectRoot,
    "cmos/foundational-docs/standing-rules.md",
  );
  const contents = readFileSync(documentPath, "utf8");

  it("keeps one contiguous 26-rule numbering with an origin on every rule", () => {
    const matches = [...contents.matchAll(/^### Rule (\d+) — .+$/gm)];
    const numbers = matches.map((match) => Number(match[1]));

    expect(numbers).toEqual(
      Array.from({ length: 26 }, (_, index) => index + 1),
    );

    const sections = contents.split(/^### Rule \d+ — .+$/gm).slice(1);
    expect(sections).toHaveLength(26);
    for (const section of sections) {
      expect(section).toMatch(/^\n\n\*\*Origin:\*\* Sprint/m);
    }
  });

  it("disambiguates the historical labels that collided", () => {
    expect(contents).toMatch(/s165 review \| `Rule 16` \| \*\*5\*\*/);
    expect(contents).toMatch(
      /Flagship memory \/ s173 Rule A \| `16` \/ `A` \| \*\*20\*\*/,
    );
    expect(contents).toMatch(/s165 review \| `Rule 17` \| \*\*6\*\*/);
    expect(contents).toMatch(
      /Flagship memory \/ s173 Rule B \| `17` \/ `B` \| \*\*21\*\*/,
    );
    expect(contents).toMatch(/s168 memo §5 \| local `13` \| \*\*7\*\*/);
    expect(contents).toMatch(/s170 block \| local `11–14` \| \*\*15–18\*\*/);
    expect(contents).toMatch(/proposed “Rule 18 \(C\)” \| \*\*22\*\*/);
  });

  it("retains every Sprint 177 candidate without re-adding existing rules", () => {
    expect(contents).toContain("candidate `R-a`");
    expect(contents).toContain("candidate | `R-b` / `C`");
    expect(contents).toContain("candidate | `R-c`");
    expect(contents).toContain("decision #1527");
    expect(contents).toContain("literal-invocation lesson");
    expect(contents).toContain("sequential-suite lesson");
  });
});
