#!/usr/bin/env node
// Check the Claude-only package, shared version, manifest metadata, and MCP
// configuration before submitting the plugin to Anthropic's directory.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const NAME = "glasser-seo-audit";
// toolset=seo selects the SEO tools on the shared /mcp (Glasser ADR-0031); the
// utm pair tells the server the install came from this plugin. OAuth takes its
// resource from the server's metadata, which has no query string.
const MCP_URL = "https://api.glasser.ai/mcp?toolset=seo&utm_source=glasser-seo-audit&utm_medium=plugin";

const root = process.cwd();
const plugin = path.join(root, "plugins", NAME);
const errors = [];
const fail = (message) => errors.push(message);
const rel = (p) => path.relative(root, p);
const readJson = (p) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (error) {
    fail(`${rel(p)}: ${error.message}`);
    return null;
  }
};

const claudeMp = readJson(path.join(root, ".claude-plugin/marketplace.json"));
const claudePl = readJson(path.join(plugin, ".claude-plugin/plugin.json"));
const skillPath = path.join(plugin, "skills/seo-audit/SKILL.md");
const skill = readFileSync(skillPath, "utf8");
const frontmatter = skill.split("\n---\n")[0];
// Agent Skills has no top-level version field; ours lives under metadata.
const frontmatterVersion = frontmatter.match(/^metadata:\n(?:[ \t]+.*\n)*?[ \t]+version:\s*"?([^"\s]+)"?/m)?.[1];
if (/^version:/m.test(frontmatter)) fail("SKILL.md: version must live under metadata, not at the top level");

// 1. One version everywhere. Clients pin installs to it.
const versions = {
  ".claude-plugin/marketplace.json metadata.version": claudeMp?.metadata?.version,
  ".claude-plugin/marketplace.json plugins[0].version": claudeMp?.plugins?.[0]?.version,
  [`plugins/${NAME}/.claude-plugin/plugin.json`]: claudePl?.version,
  [`plugins/${NAME}/skills/seo-audit/SKILL.md metadata.version`]: frontmatterVersion,
};
const distinct = new Set(Object.values(versions));
if (distinct.size !== 1 || distinct.has(undefined)) {
  const lines = Object.entries(versions).map(([k, v]) => `    ${v ?? "(missing)"}  ${k}`);
  fail(`versions disagree:\n${lines.join("\n")}`);
}

// 2. Every manifest and catalog entry names the same plugin, with the same
//    description.
for (const [label, name] of [
  ["claude marketplace entry", claudeMp?.plugins?.[0]?.name],
  [".claude-plugin/plugin.json", claudePl?.name],
]) {
  if (name !== NAME) fail(`${label}: name is ${JSON.stringify(name)}, expected "${NAME}"`);
}
const descriptions = [
  ["claude marketplace entry", claudeMp?.plugins?.[0]?.description],
  [".claude-plugin/plugin.json", claudePl?.description],
];
if (new Set(descriptions.map(([, d]) => d)).size !== 1) fail("descriptions disagree across manifests");
// claude.ai refuses an upload whose description is over 500 characters.
for (const [label, description] of descriptions) {
  if (typeof description !== "string" || description.length > 500) {
    fail(`${label}: description must be at most 500 characters, got ${description?.length}`);
  }
}

// 3. This package needs one remote server and no credentials. In particular,
//    .mcp.json has no editor-schema field or configuration for another client.
const mcp = readJson(path.join(plugin, ".mcp.json"));
for (const key of Object.keys(mcp ?? {})) {
  if (key !== "mcpServers") fail(`.mcp.json: unsupported root field ${key}`);
}
const server = mcp?.mcpServers?.["glasser-seo"];
if (Object.keys(mcp?.mcpServers ?? {}).length !== 1 || !server) fail(".mcp.json must declare only mcpServers[\"glasser-seo\"]");
if (server?.url !== MCP_URL) fail(`.mcp.json url must be ${MCP_URL}, got ${JSON.stringify(server?.url)}`);
if (server?.type !== "http") fail(`.mcp.json glasser-seo.type must be http, got ${JSON.stringify(server?.type)}`);
for (const key of Object.keys(server ?? {})) {
  if (!["type", "url"].includes(key)) fail(`.mcp.json glasser-seo: unsupported field ${key}; this server only needs type and url`);
}

// 4. Components are discovered from Claude's default locations.
for (const key of ["skills", "mcpServers"]) {
  if (claudePl && key in claudePl) fail(`.claude-plugin/plugin.json must not declare ${key} — the default location already loads`);
}
const source = claudeMp?.plugins?.[0]?.source;
if (typeof source !== "string" || !existsSync(path.join(root, source))) {
  fail(`marketplace source does not resolve: ${JSON.stringify(source)}`);
}

// 5. Keep this package's metadata-only manifest to Claude Code fields plus
//    the editor schema. This does not replicate the online policy review.
const claudeFields = new Set([
  "$schema", "name", "displayName", "version", "description", "author",
  "homepage", "repository", "license", "keywords",
]);
for (const key of Object.keys(claudePl ?? {})) {
  if (!claudeFields.has(key)) fail(`.claude-plugin/plugin.json ${key} is outside this package's allowed fields for an unverified organization`);
}

// 6. Review the exact submission contents in CI so unrelated configuration
//    and unused assets cannot silently return to the Claude bundle.
const packageFiles = new Set([
  ".claude-plugin/plugin.json", ".mcp.json", "LICENSE", "README.md", "assets/icon.png",
  "skills/seo-audit/SKILL.md",
]);
function checkFiles(dir, prefix = "") {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (entry.isDirectory()) {
      checkFiles(path.join(dir, entry.name), `${name}/`);
    } else if (!entry.isFile() || !packageFiles.has(name)) {
      fail(`plugins/${NAME}/${name}: not part of the Claude-only package`);
    }
  }
}
checkFiles(plugin);
for (const file of packageFiles) {
  if (!existsSync(path.join(plugin, file))) fail(`plugins/${NAME}/${file}: required package file is missing`);
}

// 7. The skill must never carry a pipe-to-shell install.
if (/curl[^\n]*\|\s*(ba|z)?sh\b/.test(skill) || /install\.sh/.test(skill)) fail("SKILL.md contains a curl | sh install");

if (errors.length > 0) {
  console.error("check-manifests failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`check-manifests passed (version ${[...distinct][0]}).`);
