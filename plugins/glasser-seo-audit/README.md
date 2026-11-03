# Glasser SEO Audit

An SEO audit of your own website. Give it a domain and it checks technical
and on-page health, rankings and their trend, keyword opportunities,
competitors, backlinks, search results and AI search visibility, scores the
site, and turns the findings into a prioritised action plan. Give it a
previous report and it shows what changed.

The data comes from Semrush, Ahrefs, DataForSEO and Serpstat through
Glasser's SEO tools. Calls run on your [Glasser](https://glasser.ai) account,
and each data call consumes your Glasser workspace balance. See
[glasser.ai/docs](https://glasser.ai/docs) for per-call pricing.

## Install

Claude Code:

```
/plugin install glasser-seo-audit --marketplace glasser-ai/seo-audit
```

Then ask:

- *Audit my website and show me the three SEO fixes I should make first.*
- *Find keywords my competitors rank for that my website is missing.*
- *Find five content ideas for my business, backed by keyword search volume and competition.*

Return to the conversation after connecting and send your task. The plugin
asks for your website or business and target market if they are missing.

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
