# Distribution

How Glasser SEO Audit is published and the checks that keep the package
consistent.

## Channels

| Channel | How it reads this repo | Status |
|---|---|---|
| Claude Code, self-hosted marketplace | `/plugin marketplace add glasser-ai/seo-audit` | live on push |
| Anthropic plugin directory (claude.ai, Claude Desktop) | submitted through the directory form | not submitted |
| ChatGPT / Codex plugin directory | `.codex-plugin/plugin.json` overlay | not submitted |

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

`skills/seo-audit/SKILL.md` is the audit workflow on those tools: plan and
go-ahead, an eight-step diagnosis (baseline, trend, quick wins, competitors
and gaps, technical health, authority, AI visibility, report), and the report
format. It started from `skills/seo-audit/SKILL.md` in
[glasser-ai/skills](https://github.com/glasser-ai/skills), which drives the
broker verbs instead; port changes to the process or report format by hand.
The typical charges in the skill's tool table were observed in October 2026;
re-check them when a provider's price changes.

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

`mcp.json` and `.mcp.json` are byte-identical: Claude Code reads `.mcp.json`,
Agent Plugins clients read `mcp.json`, and a symlink would break Windows
checkouts. Both are a URL and nothing else; the server speaks OAuth.

The skill's icon is a byte-identical copy of the plugin's, so the skill keeps
its icon when distributed alone. Anthropic's directory holds a version for
manual review when bundled text names an image or font file, so only the
manifests and the OpenAI yaml point at an icon; `check-manifests.mjs` fails if
a README or the skill does.
