const express = require("express");
const app = express();

app.use(express.json());

// ✅ Webhook verification (Meta will call this)
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "shradha12345";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook Verified Successfully");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403); // Forbidden
  }
});

// ✅ Webhook messages (Meta will POST here)
app.post("/webhook", (req, res) => {
  console.log("Webhook POST received:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("Shradha Hospital Webhook Server Running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
