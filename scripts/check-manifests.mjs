#!/usr/bin/env node
// Consistency checks for the package: one version everywhere, every manifest
// naming the same plugin, the mcp.json / .mcp.json pair rule, the directory
// listing fields, and the image-name and pipe-to-shell guards.
import { existsSync, readFileSync } from "node:fs";
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
const codexPl = readJson(path.join(plugin, ".codex-plugin/plugin.json"));
const agentPl = readJson(path.join(plugin, "plugin.json"));
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
  [`plugins/${NAME}/.codex-plugin/plugin.json`]: codexPl?.version,
  [`plugins/${NAME}/plugin.json`]: agentPl?.version,
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
  [".codex-plugin/plugin.json", codexPl?.name],
  ["plugin.json", agentPl?.name],
]) {
  if (name !== NAME) fail(`${label}: name is ${JSON.stringify(name)}, expected "${NAME}"`);
}
const descriptions = [
  ["claude marketplace entry", claudeMp?.plugins?.[0]?.description],
  [".claude-plugin/plugin.json", claudePl?.description],
  [".codex-plugin/plugin.json", codexPl?.description],
  [".codex-plugin/plugin.json interface.longDescription", codexPl?.interface?.longDescription],
  ["plugin.json", agentPl?.description],
];
if (new Set(descriptions.map(([, d]) => d)).size !== 1) fail("descriptions disagree across manifests");
// claude.ai refuses an upload whose description is over 500 characters.
for (const [label, description] of descriptions) {
  if (typeof description !== "string" || description.length > 500) {
    fail(`${label}: description must be at most 500 characters, got ${description?.length}`);
  }
}

// 3. The MCP pair: byte-identical, valid JSON, and nothing but a URL. Claude
//    Code reads .mcp.json, Agent Plugins clients read mcp.json; a symlink
//    would break Windows checkouts. The server speaks OAuth, so a headers
//    block or a ${VARIABLE} placeholder is a regression to the paste-a-Key setup.
const mcpRaw = readFileSync(path.join(plugin, "mcp.json"), "utf8");
const dotRaw = readFileSync(path.join(plugin, ".mcp.json"), "utf8");
if (mcpRaw !== dotRaw) fail("mcp.json and .mcp.json must be byte-identical");
let mcp = null;
try {
  mcp = JSON.parse(mcpRaw);
} catch (error) {
  fail(`mcp.json is not valid JSON: ${error.message}`);
}
const server = mcp?.mcpServers?.glasser;
if (!server) fail("mcp.json must declare mcpServers.glasser");
if (server && server.url !== MCP_URL) fail(`mcp.json url must be ${MCP_URL}, got ${JSON.stringify(server?.url)}`);
if (server && "headers" in server) fail("mcp.json must not carry headers — the server signs the user in with OAuth");
if (/\$\{/.test(mcpRaw)) fail("mcp.json must not reference a ${VARIABLE} — there is no Key to fill in");
// Anthropic's directory requires every remote MCP server to name its transport.
if (server && !["http", "sse", "ws"].includes(server.type)) fail(`mcp.json glasser.type must be http, sse or ws, got ${JSON.stringify(server.type)}`);

// 4. Component discovery is left to the default locations and the portable
//    manifest; the Claude and Codex manifests only carry listing fields.
for (const [label, manifest] of [[".claude-plugin/plugin.json", claudePl], [".codex-plugin/plugin.json", codexPl]]) {
  for (const key of ["skills", "mcpServers"]) {
    if (manifest && key in manifest) fail(`${label} must not declare ${key} — the default location already loads`);
  }
}
if (agentPl?.extensions?.["com.openai"]) fail("plugin.json must not shadow the .codex-plugin/plugin.json overlay");
const source = claudeMp?.plugins?.[0]?.source;
if (typeof source !== "string" || !existsSync(path.join(root, source))) {
  fail(`marketplace source does not resolve: ${JSON.stringify(source)}`);
}

// 5. Directory listing fields: Anthropic reads them from the Claude manifest,
//    OpenAI from the Codex overlay. Keep the two pointing at the same pages.
if (!claudePl?.privacyPolicyUrl?.startsWith("https://") || claudePl.privacyPolicyUrl !== codexPl?.interface?.privacyPolicyURL) {
  fail(".claude-plugin/plugin.json privacyPolicyUrl must be https:// and match .codex-plugin interface.privacyPolicyURL");
}
if (!claudePl?.termsOfServiceUrl?.startsWith("https://") || claudePl.termsOfServiceUrl !== codexPl?.interface?.termsOfServiceURL) {
  fail(".claude-plugin/plugin.json termsOfServiceUrl must be https:// and match .codex-plugin interface.termsOfServiceURL");
}
for (const [label, iconRel] of [
  [".claude-plugin/plugin.json icon", claudePl?.icon],
  [".codex-plugin/plugin.json interface.logo", codexPl?.interface?.logo],
  [".codex-plugin/plugin.json interface.composerIcon", codexPl?.interface?.composerIcon],
]) {
  if (typeof iconRel !== "string" || !existsSync(path.join(plugin, iconRel))) fail(`${label} must point at an existing file, got ${JSON.stringify(iconRel)}`);
}
// The skill declares its own icon for OpenAI; keep its copy identical.
const pluginIcon = readFileSync(path.join(plugin, "assets/icon.png"));
const skillIcon = path.join(plugin, "skills/seo-audit/assets/icon.png");
if (!existsSync(skillIcon) || !pluginIcon.equals(readFileSync(skillIcon))) fail("skills/seo-audit/assets/icon.png must be a byte-identical copy of assets/icon.png");

// 6. Anthropic's directory holds a version for manual review when bundled text
//    names an image or font file. Only manifests may point at the icon.
for (const textRel of ["README.md", "skills/seo-audit/SKILL.md"]) {
  if (/\.(png|svg|jpe?g|gif|webp|ico|woff2?|ttf|otf)\b/i.test(readFileSync(path.join(plugin, textRel), "utf8"))) {
    fail(`plugins/${NAME}/${textRel} names an image or font file`);
  }
}

// 7. The skill must never carry a pipe-to-shell install.
if (/curl[^\n]*\|\s*(ba|z)?sh\b/.test(skill) || /install\.sh/.test(skill)) fail("SKILL.md contains a curl | sh install");

if (errors.length > 0) {
  console.error("check-manifests failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`check-manifests passed (version ${[...distinct][0]}).`);
