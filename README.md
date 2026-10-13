# Glasser SEO Audit

An SEO audit of your own website, for Claude and ChatGPT.

Give it a domain. It checks technical and on-page health, rankings, keyword
opportunities, backlinks, organic competitors and AI search visibility,
scores the site out of 100, and writes a prioritised action plan: what blocks
indexing now, what to fix in the next 30 days, what to build this quarter.
Run it again later and it reports what was fixed, what is new and what moved.

## Where the data comes from

| Dimension | Providers |
|---|---|
| Rankings, organic keywords, top pages | Ahrefs, Semrush, DataForSEO, Serpstat |
| Keyword volume, difficulty, intent | Ahrefs, Semrush, DataForSEO, Serpstat |
| Organic competitors and keyword gaps | Ahrefs, Semrush, DataForSEO, Serpstat |
| Backlinks and referring domains | Ahrefs, DataForSEO, Serpstat |
| Site crawl, on-page checks, Lighthouse | DataForSEO |
| Live SERPs and AI Overviews | SerpApi, DataForSEO |
| AI search visibility | Ahrefs, DataForSEO |

You need no account with any of them. The plugin reaches them through
[Glasser](https://glasser.ai): one sign-in, pay per call, no subscription.
Before the audit runs, it shows the plan — pages sampled, keywords,
competitors, provider per dimension — with the estimated cost, and waits for
your go-ahead. Failed calls and empty results cost $0.00. The report ends with
the total charged and a link to every call it used.

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
- *Why is example.com not ranking, and what should we fix first?*
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
| `https://api.glasser.ai/mcp` | the MCP server config | the OAuth access token the client obtains at sign-in |
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
├── .mcp.json, mcp.json             the Glasser MCP server, byte-identical
├── assets/                         icon
└── skills/seo-audit/               the audit workflow and report format
scripts/                            consistency check and the version bump
```

Releasing: see [DISTRIBUTION.md](DISTRIBUTION.md).

## License

MIT — see [LICENSE](LICENSE). The Glasser service has its own terms.
