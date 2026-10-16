// backend/utils/prepareMessages.js
//
// Turns the messages sent by the chat UI into the messages sent to the AI provider.
// Text files the user attached arrive as attachments: [{ name, text }] on a user message;
// they are pasted into that message between marker lines so the model can read them.
// Everything here is limited on purpose: the client can't be trusted to keep within bounds.

const MAX_MESSAGES = 20; // most recent messages kept
const MAX_TEXT_CHARS = 8000; // per message, typed text only
const MAX_FILES_PER_MESSAGE = 6;
const MAX_FILE_CHARS = 30000; // per file
const MAX_ATTACHMENT_CHARS_TOTAL = 60000; // all files in one request (newest files win)

const cleanName = (n) =>
  String(n || "file")
    .replace(/[\u0000-\u001f\u007f\[\]]/g, " ")
    .trim()
    .slice(0, 200) || "file";

function readFiles(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((a) => a && typeof a.text === "string" && a.text.trim())
    .slice(0, MAX_FILES_PER_MESSAGE)
    .map((a) => ({ name: cleanName(a.name), text: a.text.replace(/\u0000/g, "") }));
}

function prepareMessages(messages) {
  const normalized = messages
    .filter((m) => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_TEXT_CHARS),
      files: m.role === "user" ? readFiles(m.attachments) : [],
    }))
    .filter((m) => m.content.trim() || m.files.length > 0)
    .slice(-MAX_MESSAGES);

  // Spend the file budget from the newest message backwards
  let budget = MAX_ATTACHMENT_CHARS_TOTAL;
  for (let i = normalized.length - 1; i >= 0; i--) {
    normalized[i].files = normalized[i].files
      .map((f) => {
        const allowed = Math.min(MAX_FILE_CHARS, budget);
        budget -= Math.max(0, Math.min(allowed, f.text.length)); // only what the file really uses
        return allowed > 0 ? { name: f.name, text: f.text.slice(0, allowed), cut: f.text.length > allowed } : null;
      })
      .filter(Boolean);
  }

  return normalized.map((m) => {
    const blocks = m.files.map(
      (f) =>
        `[Attached file: ${f.name}]\n${f.text}${f.cut ? "\n[...file cut here: too long...]" : ""}\n[End of attached file: ${f.name}]`
    );
    return { role: m.role, content: [m.content.trim(), ...blocks].filter(Boolean).join("\n\n") };
  });
}

module.exports = { prepareMessages };
