# Distribution

How Glasser SEO Audit is published and the checks that keep the package
consistent.

## Channels

| Channel | How it reads this repo | Status |
|---|---|---|
| Claude Code, self-hosted marketplace | `/plugin marketplace add glasser-ai/seo-audit` | live on push |
| Anthropic plugin directory (claude.ai, Claude Desktop) | claude.ai/directory/manage: submit the Glasser MCP server as an MCP connector, then this repo as a Plugin bundle (path `plugins/glasser-seo-audit`) | not submitted |
| ChatGPT / Codex plugin directory | ZIP of `plugins/glasser-seo-audit` uploaded at platform.openai.com/plugins | not submitted |

## Release checklist

1. Edit files under `plugins/glasser-seo-audit/`.
2. `node scripts/bump-version.mjs <version>` — writes the version into the
   marketplace, the three manifests and the skill frontmatter. Clients pin
   installs to `version`; a change without a bump reaches nobody.
3. `node scripts/check-manifests.mjs` and `claude plugin validate --strict .`
4. Commit and push.

## The MCP server and the skill

The plugin connects to the SEO toolset of Glasser's MCP server,
`https://api.glasser.ai/mcp?toolset=seo` (Glasser ADR-0031). Without
`toolset` the same server serves the seven broker verbs (search / inspect /
run …); with it, fourteen SEO tools, each one action of the `seo_research`
Solution, plus `runs_get` and `balance`. OAuth is the same `/mcp` resource:
the query string is dropped when the token's audience is checked.

`skills/seo-audit/SKILL.md` is `skills/seo-audit/SKILL.md` from
[glasser-ai/skills](https://github.com/glasser-ai/skills) with only what the
tools force changed: the opening (this plugin's connector instead of the CLI
install), "endpoint" → "tool" in step 3, and the dimensions table (tool names
instead of catalog search queries). Inputs, the process, scoring, the report
format and the untrusted-input rule are the original's text. Port changes to
those sections by hand; do not add steps the original does not have.

## Naming providers

The description, the READMEs and the skill name Semrush, Ahrefs, DataForSEO
and Serpstat (and the README Serper). Each was confirmed in the Glasser catalog with `search`
before release. Re-check before adding or removing one, and do not name a
provider reached only through a scraper.

## Manifests

| File | Read by | Carries |
|---|---|---|
| `plugin.json` | Agent Plugins clients, Codex | name, version, description; components are discovered from the default locations |
| `.claude-plugin/plugin.json` | Claude Code, Anthropic's directory | listing fields: `icon`, `privacyPolicyUrl`, `termsOfServiceUrl` |
| `.codex-plugin/plugin.json` | ChatGPT, Codex | the `interface` block: display name, short description, prompts, icons |
| `skills/seo-audit/agents/openai.yaml` | ChatGPT, Codex | the skill's own display name and icon |

`mcp.json` and `.mcp.json` name the same server (`glasser-seo`) at the same
URL. Claude Code reads `.mcp.json` and wants `type: "http"`; Agent Plugins
clients (Codex, ChatGPT) read `mcp.json`, whose schema allows
`"streamable-http"` and not `"http"`. `check-manifests.mjs` checks each type
and that both URLs match. Both are a URL and nothing else; the server speaks
OAuth.

The skill's icon is a byte-identical copy of the plugin's, so the skill keeps
its icon when distributed alone. Anthropic's directory holds a version for
manual review when bundled text names an image or font file, so only the
manifests and the OpenAI yaml point at an icon; `check-manifests.mjs` fails if
a README or the skill does.
