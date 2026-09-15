// s201-m07 advertised diff: every commit from the base, its changed paths, and the advertised-surface paths attributed by mission.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = "/Users/systemsystems/.codex/worktrees/s201/OODS-Forge";
const base = "c02f3ddcb";
const git = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const head = git(["rev-parse", "HEAD"]).trim();
const ADVERTISED = [
  /^packages\/mcp-server\/src\/schemas\/.*\.json$/, /^packages\/mcp-adapter\/tool-descriptions\.json$/, /^packages\/mcp-server\/registry\//,
  /^docs\/api\//, /^docs\/mcp\//, /^docs\/runtime\//, /^README\.md$/, /^CHANGELOG\.md$/, /^package\.json$/, /^packages\/[^/]+\/package\.json$/,
  /^packages\/mcp-server\/src\/errors\/registry\.ts$/, /^packages\/viz-core\/src\/registry\//, /^packages\/viz-render\/certified-matrix\.json$/,
  /^scripts\/runtime\/(manifest|client-configs)\.mjs$/, /^install\.md$/, /^THIRD-PARTY-NOTICES\.md$/,
];
const missionOf = (subject) => /\((s201-m0\d)\)/.exec(subject)?.[1] ?? (/planning|s201/i.test(subject) ? "planning" : "other");
const commits = git(["log", "--format=%h%x09%s", `${base}..${head}`]).trim().split("\n").filter(Boolean).map((line) => {
  const [sha, subject] = line.split("\t");
  const files = git(["show", "--name-only", "--format=", sha]).trim().split("\n").filter(Boolean);
  return { sha, mission: missionOf(subject), subject, files: files.length, paths: files };
});
const byPath = new Map();
for (const commit of commits) for (const file of commit.paths) {
  const row = byPath.get(file) ?? { path: file, advertised: ADVERTISED.some((pattern) => pattern.test(file)), missions: [], commits: [] };
  if (!row.missions.includes(commit.mission)) row.missions.push(commit.mission);
  row.commits.push(commit.sha);
  byPath.set(file, row);
}
const paths = [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
const pathsByMission = Object.fromEntries([...new Set(commits.map((commit) => commit.mission))].map((mission) => [mission, paths.filter((row) => row.missions.includes(mission)).length]));
const report = { builderSelfCertified: false, base, head, commits: commits.map(({ paths: _paths, ...commit }) => commit), changedPaths: paths.length, advertisedPaths: paths.filter((row) => row.advertised).length, pathsByMission, advertised: paths.filter((row) => row.advertised), paths };
fs.writeFileSync(path.join(root, "artifacts/product-reality/sprint-201/m07/closeout/advertised-diff.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ commits: commits.length, changedPaths: report.changedPaths, advertisedPaths: report.advertisedPaths, pathsByMission }));
