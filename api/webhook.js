const LINE_TOKEN = process.env.LINE_TOKEN;
// Vercelの環境変数に「通知を送りたい相手のLINEのユーザーID(Uから始まるもの)」を設定してください
const TARGET_USER_ID = process.env.TARGET_USER_ID; 

async function pushMessage(userId, text) {
  await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LINE_TOKEN}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text }],
    }),
  });
}

export default async function handler(req, res) {
  // GETなどのアクセスは弾く
  if (req.method !== "POST") return res.status(200).send("OK");

  try {
    // 💬 ここにLINEに送りたいメッセージを書いてください
    const message = "⏰ 時間になりました！定期通知です。";
    
    await pushMessage(TARGET_USER_ID, message);
    console.log("LINEへの通知が成功しました。");
    
    return res.status(200).send("Success");
  } catch (error) {
    console.error("エラーが発生しました:", error);
    return res.status(500).send("Internal Server Error");
  }
}
