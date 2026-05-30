export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }
  console.log("Received:", JSON.stringify(req.body));
  return res.status(200).send("OK");
}
