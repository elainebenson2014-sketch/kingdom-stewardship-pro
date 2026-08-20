// Vercel serverless function: /api/find-grants
// Uses Claude with the web search tool to find real, current grant
// opportunities for a faith-based / nonprofit org.
//
// Requires an env var in Vercel: ANTHROPIC_API_KEY
// (Settings -> Environment Variables -> add ANTHROPIC_API_KEY)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error:
        "The grant finder isn't configured yet. Add ANTHROPIC_API_KEY in the Vercel project settings, then redeploy.",
    });
    return;
  }

  // Body is auto-parsed by Vercel when content-type is application/json
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const {
    orgName = "",
    location = "Houston, TX",
    orgType = "501(c)(3) church / faith-based nonprofit",
    focusAreas = "",
    need = "",
  } = body;

  const userPrompt = `Find real, currently-open grant opportunities that this organization would plausibly qualify for. Use web search to find actual grants — do not invent any.

ORGANIZATION
- Name: ${orgName || "(a faith-based nonprofit)"}
- Location: ${location}
- Type: ${orgType}
- Focus areas: ${focusAreas || "general ministry, community programs"}
- Current need/project: ${need || "general operating and program support"}

Prioritize grants that:
- Are open to faith-based organizations or 501(c)(3) nonprofits
- Serve the ${location} area (local/regional foundations count, plus national funders open to this org)
- Match the focus areas or stated need

For EACH grant you find real evidence for, capture: the grant/program name, the funder, a typical or maximum award amount, the application deadline if stated, the focus area, who qualifies, and the application URL.

After searching, output ONLY a JSON array of the grants, wrapped exactly between the markers <GRANTS_JSON> and </GRANTS_JSON>. Use this shape for each item:
{
  "name": "string",
  "funder": "string or null",
  "amount": number or null,
  "deadline": "YYYY-MM-DD or null",
  "focus_area": "string or null",
  "eligibility": "string or null",
  "link": "string or null"
}
Include 4-8 grants if you can find them. If a field is unknown, use null. Do not include any grant you could not find on the web.`;

  const buildRequest = (messages) => ({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    messages,
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 6 }],
  });

  try {
    let messages = [{ role: "user", content: userPrompt }];
    let data;
    // Loop to handle pause_turn on long search turns (cap the iterations)
    for (let i = 0; i < 4; i++) {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(buildRequest(messages)),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        res.status(502).json({
          error: "Search service error.",
          detail: errText.slice(0, 500),
        });
        return;
      }

      data = await resp.json();

      if (data.stop_reason === "pause_turn" && Array.isArray(data.content)) {
        // Continue the paused turn: send the assistant message back unchanged
        messages = [...messages, { role: "assistant", content: data.content }];
        continue;
      }
      break;
    }

    // Gather all text blocks from the final response
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const grants = extractGrants(text);

    res.status(200).json({ grants, raw: grants.length ? undefined : text.slice(0, 800) });
  } catch (e) {
    res.status(500).json({ error: "Something went wrong while searching.", detail: String(e).slice(0, 300) });
  }
}

function extractGrants(text) {
  if (!text) return [];
  // Prefer the marked block; fall back to the first JSON array in the text
  let json = null;
  const marked = text.match(/<GRANTS_JSON>([\s\S]*?)<\/GRANTS_JSON>/);
  if (marked) json = marked[1].trim();
  if (!json) {
    const arr = text.match(/\[[\s\S]*\]/);
    if (arr) json = arr[0];
  }
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((g) => ({
      name: g.name || "Untitled grant",
      funder: g.funder ?? null,
      amount: g.amount != null && g.amount !== "" ? Number(g.amount) : null,
      deadline: g.deadline || null,
      focus_area: g.focus_area ?? null,
      eligibility: g.eligibility ?? null,
      link: g.link ?? null,
    }));
  } catch {
    return [];
  }
}
