// Vercel serverless function: /api/draft-application
// Drafts a grant application narrative with Claude, using the grant details
// and the church/org profile. Uses the same ANTHROPIC_API_KEY env var.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: "The writer isn't configured yet. Add ANTHROPIC_API_KEY in Vercel and redeploy.",
    });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const {
    grant = {},
    orgName = "",
    mission = "",
    programs = "",
    community = "",
    project = "",
    amount = "",
  } = body;

  const prompt = `You are an experienced grant writer for faith-based nonprofits. Draft a complete, professional grant application narrative for the grant below, using the organization's information. Write in a sincere, credible tone suitable for a church/ministry applicant. Where a needed detail is missing, insert a clearly marked [bracketed placeholder] the applicant can fill in — never invent specific figures, names, or statistics.

GRANT
- Name: ${grant.name || "(unnamed grant)"}
- Funder: ${grant.funder || "(unknown)"}
- Focus area: ${grant.focus_area || "(general)"}
- Who qualifies: ${grant.eligibility || "(not specified)"}

ORGANIZATION
- Name: ${orgName || "(applicant organization)"}
- Mission: ${mission || "[state the mission]"}
- Programs/ministries: ${programs || "[list key programs]"}
- Community served: ${community || "[describe the community served]"}
- Project this funding supports: ${project || "[describe the project or need]"}
- Amount requested: ${amount ? "$" + amount : "[amount]"}

Write these sections, each with a bold header:
1. Organization Background
2. Statement of Need
3. Project Description
4. Goals & Measurable Outcomes
5. Budget Narrative
6. Sustainability

Keep it focused and grounded in what's provided. Return only the application draft — no preamble or commentary.`;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 3500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      res.status(502).json({ error: "Writing service error.", detail: errText.slice(0, 500) });
      return;
    }

    const data = await resp.json();
    const draft = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    res.status(200).json({ draft });
  } catch (e) {
    res.status(500).json({ error: "Something went wrong while drafting.", detail: String(e).slice(0, 300) });
  }
}
