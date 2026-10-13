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

## The skill

`skills/seo-audit/SKILL.md` is ported from `skills/seo-audit/SKILL.md` in
[glasser-ai/skills](https://github.com/glasser-ai/skills) and rewritten for
the MCP tools. It differs from that source in three ways:

- **Setup** follows [glasser-ai/claude-plugin](https://github.com/glasser-ai/claude-plugin):
  connect the connector, set its tools to Always allow, never paste a Key.
- **Price the plan** is new: the audit `inspect`s one Endpoint per dimension,
  estimates the total, and waits for the user's go-ahead before the first
  `run`.
- **The report** ends with the total charged and a `run_url` per Run, and is
  saved to a file when the client can, so the next audit can compare.

When the source's process, scoring or report format changes, port the change
here by hand and bump the version.

## Naming providers

The description, the READMEs and the skill name Ahrefs, Semrush, DataForSEO,
Serpstat and SerpApi. Each was confirmed in the Glasser catalog with `search`
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
