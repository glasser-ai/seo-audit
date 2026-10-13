# Glasser SEO Audit

An SEO audit of any website. Give it a domain and it reads rankings and their
trend, finds quick wins, compares the site with competitors keyword by keyword
and link by link, crawls it for technical problems, checks key pages and AI
search visibility, and turns the findings into a prioritised action plan. Run
it again later and it reports what changed.

The data comes from Semrush, Ahrefs, DataForSEO and Serpstat through
Glasser's SEO tools, bought per call through [Glasser](https://glasser.ai) —
no subscription to any of them. Before the audit runs, it shows the plan and its estimated cost
and waits for your go-ahead.

## Install

Claude Code:

```
/plugin install glasser-seo-audit --marketplace glasser-ai/seo-audit
```

Then ask: *"Run an SEO audit of example.com for the US market."*

Authentication and the list of network endpoints are in the
[repository README](https://github.com/glasser-ai/seo-audit#readme).

| Component | File |
|---|---|
| Skill | `skills/seo-audit/SKILL.md` |
| MCP server | `.mcp.json` (and `mcp.json` for clients that read that name) |

The MCP config points at `https://api.glasser.ai/mcp?toolset=seo` and carries no
credentials: the server speaks OAuth, so the client signs the user in on
first use. The plugin ships no executable code.

The service behind it is governed by Glasser's
[terms of service](https://glasser.ai/terms-of-service) and
[privacy policy](https://glasser.ai/privacy-policy).
