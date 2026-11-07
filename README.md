# Glasser SEO Audit

An SEO audit of your own website, for Claude and ChatGPT.

Give it a domain. It checks technical and on-page health, rankings and their
trend, keyword opportunities, organic competitors and the keywords they rank
for that you do not, backlinks, search results and AI search visibility,
scores the site, and writes a prioritised action plan. Give it a previous
report and it shows what was fixed, what is new and what moved.

## Where the data comes from

The plugin connects to Glasser's SEO tools (`https://api.glasser.ai/mcp?toolset=seo`):

| Tool | Data | Providers |
|---|---|---|
| `inspect_domain`, `list_ranked_keywords` | organic overview, ranked keywords | DataForSEO, Serpstat, Ahrefs |
| `inspect_search_visibility` | month-by-month keyword count and traffic | Semrush, DataForSEO |
| `discover_competitors` | organic competitors | DataForSEO, Serpstat, Ahrefs |
| `compare_keyword_gap` | the site vs up to four competitors, keyword by keyword | Semrush, DataForSEO |
| `inspect_keywords`, `research_keywords` | volume, difficulty, keyword ideas | Semrush, Serpstat, DataForSEO, Ahrefs |
| `inspect_serp` | live Google results | DataForSEO, Serper |
| `inspect_backlinks`, `compare_backlink_gap` | backlink profile, link-building prospects | Semrush, DataForSEO, Ahrefs |
| `audit_site`, `inspect_page` | site crawl, single-page check | DataForSEO |
| `inspect_ai_visibility`, `discover_ai_citations` | citations in AI answers | Ahrefs, DataForSEO |

You need no account with any of them. Calls run on your Glasser account, and
each data call consumes your Glasser workspace balance. See
[glasser.ai/docs](https://glasser.ai/docs) for per-call pricing. The report
ends with a link to every call it used.

## Install

**Claude Code**

```
/plugin marketplace add glasser-ai/seo-audit
/plugin install glasser-seo-audit@glasser-seo-audit
```

**claude.ai, Claude Desktop, ChatGPT** — install **Glasser SEO Audit** from
the client's plugin directory.

Then ask, for example:

- *Run an SEO audit of example.com for the US market.*
- *What keywords do my competitors rank for that example.com does not?*
- *Is example.com cited in AI answers, and by which pages?*
- *Here is last month's audit — what has changed?*

## Authentication

Nothing to create or paste. On first use the client opens your browser: sign
in to Glasser, choose the Workspace whose balance the audit may spend, and
click **Allow**. That mints a Key named `MCP · <client>` for that Workspace —
it is listed at https://app.glasser.ai/keys, and revoking it there
disconnects the client.

## Network endpoints and credentials

For reviewers and anyone auditing what this plugin reaches.

| Endpoint | Used by | Credential |
|---|---|---|
| `https://api.glasser.ai/mcp?toolset=seo` | the MCP server config (the SEO toolset of Glasser's MCP server) | the OAuth access token the client obtains at sign-in |
| `https://app.glasser.ai/api/auth` | the client, at sign-in | OAuth authorization server: discovery, client registration, tokens |
| `https://app.glasser.ai` | sign-in and the Workspace consent page; Key management | your browser session |

Nothing in this repository executes. The plugin sends no telemetry of its
own. The service behind these endpoints is governed by Glasser's
[terms of service](https://glasser.ai/terms-of-service) and
[privacy policy](https://glasser.ai/privacy-policy).

## Repository layout

```
.claude-plugin/marketplace.json     Claude Code marketplace
plugins/glasser-seo-audit/
├── plugin.json                     portable manifest (Agent Plugins); clients discover the skill and MCP from it
├── .claude-plugin/plugin.json      Claude manifest and directory listing fields
├── .codex-plugin/plugin.json       ChatGPT / Codex display overlay
├── .mcp.json, mcp.json             the Glasser MCP server, same URL (type http / streamable-http)
├── assets/                         icon
└── skills/seo-audit/               the audit workflow and report format
scripts/                            consistency check and the version bump
```

Support: [Discord](https://discord.gg/kM5eyKzx5a). Releasing: see [DISTRIBUTION.md](DISTRIBUTION.md).

## License

MIT — see [LICENSE](LICENSE). The Glasser service has its own terms.
