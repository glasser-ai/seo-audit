#!/usr/bin/env node
// Write one version into every place that carries it. Clients pin installs to
// `version`, so a content change without a bump reaches nobody — and six
// places is too many to edit by hand consistently.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const next = process.argv[2];
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(next ?? "")) {
  console.error("usage: node scripts/bump-version.mjs <semver>");
  process.exit(2);
}

const root = process.cwd();
const plugin = "plugins/glasser-seo-audit";
const targets = [
  [".claude-plugin/marketplace.json", (d) => { d.metadata.version = next; d.plugins[0].version = next; }],
  [`${plugin}/.claude-plugin/plugin.json`, (d) => { d.version = next; }],
  [`${plugin}/.codex-plugin/plugin.json`, (d) => { d.version = next; }],
  [`${plugin}/plugin.json`, (d) => { d.version = next; }],
];
for (const [file, apply] of targets) {
  const p = path.join(root, file);
  const data = JSON.parse(readFileSync(p, "utf8"));
  apply(data);
  writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`${file} -> ${next}`);
}

const skillFile = `${plugin}/skills/seo-audit/SKILL.md`;
const skillPath = path.join(root, skillFile);
const skill = readFileSync(skillPath, "utf8");
const versionLine = /^(metadata:\n(?:[ \t]+.*\n)*?[ \t]+version:\s*"?)[^"\s]+/m;
if (!versionLine.test(skill)) {
  console.error(`${skillFile}: frontmatter has no metadata.version`);
  process.exit(1);
}
writeFileSync(skillPath, skill.replace(versionLine, `$1${next}`));
console.log(`${skillFile} -> ${next}`);
console.log("next: node scripts/check-manifests.mjs");
