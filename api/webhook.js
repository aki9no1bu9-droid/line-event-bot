import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
const LINE_TOKEN = process.env.LINE_TOKEN;

function parseDate(str) {
  const [m, d] = str.split("/").map(Number);
  if (!m || !d || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const now = new Date();
  let year = now.getFullYear();
  const today = new Date(year, now.getMonth(), now.getDate());
  const candidate = new Date(year, m - 1, d);
  if (candidate < today) year++;
  return `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

async function reply(replyToken, text) {
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LINE_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  const events = req.body?.events || [];
  for (const event of events) {
    if (event.type !== "message" || event.message.type !== "text") continue;
    const text = event.message.text.trim();
    if (!text.startsWith("/予定")) continue;

    const parts = text.split(/\s+/);
    if (parts.length < 4) {
      await reply(event.replyToken, "書式: /予定 6/3 18:00 内容");
      continue;
    }

    const date = parseDate(parts[1]);
    const time = parts[2];
    const content = parts.slice(3).join(" ");

    if (!date) {
      await reply(event.replyToken, "日付の形式が違うよ。例: /予定 6/3 18:00 内容");
      continue;
    }

    const { error } = await supabase
      .from("events")
      .insert({ date, time, content });

    if (error) {
      await reply(event.replyToken, "保存失敗: " + error.message);
    } else {
      await reply(event.replyToken, `✅ 登録したよ\n${date} ${time}\n${content}`);
    }
  }

  res.status(200).send("OK");
}
