# Distribution

How Glasser SEO Audit is published and the checks that keep the package
consistent.

## Channels

| Channel | How it reads this repo | Status |
|---|---|---|
| Claude Code, self-hosted marketplace | `/plugin marketplace add glasser-ai/seo-audit` | live on push |
| Anthropic plugin directory (claude.ai, Claude Desktop) | claude.ai/directory/manage: submit this repo as a Plugin bundle (path `plugins/glasser-seo-audit`) | v0.2.10 refused by directory policy; scheduled commit checks are active; never live |

## Release checklist

1. Edit files under `plugins/glasser-seo-audit/`.
2. `node scripts/bump-version.mjs <version>` — writes the version into the
   marketplace, the Claude manifest and the skill frontmatter. Clients pin
   installs to `version`; a change without a bump reaches nobody.
3. Run `node scripts/check-manifests.mjs`, `claude plugin validate --strict .`,
   and `claude plugin validate ./plugins/glasser-seo-audit --strict --profile directory`.
4. Commit and push.
5. In Anthropic's directory, click **Check for new commits** and confirm
   the new commit passes **Directory policy**. Local validation does not run
   that policy review.

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

## Claude submission contents

The submitted folder is for Claude only. Its complete file list is:

| File | Purpose |
|---|---|
| `.claude-plugin/plugin.json` | Claude metadata |
| `.mcp.json` | The remote `glasser-seo` MCP server |
| `skills/seo-audit/SKILL.md` | The audit workflow and report format |
| `README.md` | Installation, service disclosure, and legal links |
| `LICENSE` | Plugin license |
| `assets/icon.png` | Claude's automatically discovered listing icon |

`.mcp.json` has only a top-level `mcpServers` object. Its single server
entry has `type: "http"` and the Glasser URL, with no schema annotation or
credentials; the client signs the user in through OAuth. Skills and the MCP
server are discovered from Claude's default locations.

`check-manifests.mjs` enforces the file list, the MCP configuration, Claude
metadata fields, and matching versions. Additions to the submitted package
must update this check deliberately.

The directory refused v0.2.8 and v0.2.10 under its policy for configuration
fields outside the allowed lists. Removing five listing fields cleared the
individual warnings in v0.2.10, but did not clear the policy refusal. That
report did not identify the remaining offending file or key. The next
release removes other-client configuration and the MCP schema annotation;
the online policy check must still confirm whether this resolves the refusal.
The README retains the privacy policy and terms of service links.
