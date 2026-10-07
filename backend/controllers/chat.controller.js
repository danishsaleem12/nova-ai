const SYSTEM_PROMPT =
  "You are NovaAI, a helpful, friendly assistant. Be clear and practical. Use markdown lists, **bold**, and ``` code fences when useful.";

// UI model ids -> real model names. Unknown ids fall back to AI_MODEL.
const MODEL_MAP = {
  "nova-pro": "openai/gpt-oss-120b",
  "nova-fast": "openai/gpt-oss-20b",
};

const chat = async (req, res) => {
  const { messages, model } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: "messages are required" });
  }

  const clean = messages
    .filter(
      (m) =>
        m &&
        ["user", "assistant"].includes(m.role) &&
        typeof m.content === "string" &&
        m.content.trim()
    )
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));

  if (clean.length === 0) return res.status(400).json({ message: "no valid messages" });

  const controller = new AbortController();
  res.on("close", () => controller.abort());

  try {
    const upstream = await fetch(`${process.env.AI_BASE_URL}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_MAP[model] || process.env.AI_MODEL,
        stream: true,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...clean],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      console.error("AI provider error:", upstream.status, detail);
      const msg =
        upstream.status === 429 ? "Rate limit reached. Try again in a minute." : "AI service error.";
      return res.status(502).json({ message: msg });
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Accel-Buffering", "no");

    const decoder = new TextDecoder();
    let buffer = "";

    for await (const chunk of upstream.body) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        const l = line.trim();
        if (!l.startsWith("data:")) continue;
        const data = l.slice(5).trim();
        if (data === "[DONE]") continue;
        try {
          const delta = JSON.parse(data).choices?.[0]?.delta?.content;
          if (delta) res.write(delta);
        } catch {
          /* ignore partial JSON */
        }
      }
    }
    res.end();
  } catch (err) {
    if (err.name === "AbortError") return;
    console.error("chat error:", err);
    if (!res.headersSent) res.status(500).json({ message: "Server error" });
    else res.end();
  }
};

module.exports = { chat };