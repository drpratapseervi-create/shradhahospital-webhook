const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// ✅ Your Verify Token (same as Meta Webhooks)
const VERIFY_TOKEN = "shradha12345";

// ✅ WhatsApp Cloud API Settings (Render Environment Variables)
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; // Permanent/Temporary token
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID; // From Meta WhatsApp API Setup

// ---------- Replies ----------
const MAIN_MENU =
  `Welcome to Shradha Hospital & Multispeciality Hospital 🏥\n` +
  `Please choose an option:\n\n` +
  `1️⃣ Book Appointment\n` +
  `2️⃣ OPD Timing & Location\n` +
  `3️⃣ Emergency / Ambulance\n` +
  `4️⃣ Doctors Available\n` +
  `5️⃣ Talk to Reception\n\n` +
  `Reply with 1 / 2 / 3 / 4 / 5`;

const REPLY_2 =
  `OPD Timing: 9:00 AM to 7:00 PM\n` +
  `Address: Pani ki do tanki, Surajpole, Pali (Raj) – 306401`;

const REPLY_3 =
  `🚨 Emergency / Ambulance\nCall now: 9414122542`;

const REPLY_4 =
  `👨‍⚕️ Doctors Available at Shradha Hospital:\n` +
  `• Dr. Pratap Senecha (MS) – General Surgery\n` +
  `• Dr. Suryakanta Senecha (DGO) – Obstetrician & Gynecology\n` +
  `• Dr. Vijay Gehlot (MS) – Orthopedics`;

const REPLY_5 =
  `For reception help, please call: 9414122542\n` +
  `We will assist you.`;

const REPLY_1 =
  `To book appointment, please send:\n` +
  `Patient Name:\nAge:\nProblem:\nPreferred Doctor (if any):\nPreferred Time:`;

// ---------- Helper: Send WhatsApp message ----------
async function sendWhatsAppText(to, text) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.log("❌ Missing WHATSAPP_TOKEN or PHONE_NUMBER_ID in Render Environment Variables");
    return;
  }

  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: to,
    text: { body: text }
  };

  await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    }
  });
}

// ---------- Webhook Verification ----------
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook Verified Successfully");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// ---------- Incoming WhatsApp Messages ----------
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    // Always respond 200 quickly
    res.sendStatus(200);

    // Safety checks
    if (!body.entry) return;

    const changes = body.entry?.[0]?.changes?.[0]?.value;
    const messages = changes?.messages;

    if (!messages || messages.length === 0) return;

    const msg = messages[0];
    const from = msg.from; // sender whatsapp number
    const text = msg.text?.body?.trim() || "";

    console.log("📩 Incoming message from:", from, "Text:", text);

    // Simple routing
    const lower = text.toLowerCase();

    let reply = null;

    if (["hi", "hello", "hii", "hey", "namaste"].includes(lower)) {
      reply = MAIN_MENU;
    } else if (text === "1") {
      reply = REPLY_1;
    } else if (text === "2") {
      reply = REPLY_2;
    } else if (text === "3") {
      reply = REPLY_3;
    } else if (text === "4") {
      reply = REPLY_4;
    } else if (text === "5") {
      reply = REPLY_5;
    } else {
      reply =
        `Thank you for contacting Shradha Hospital.\n\n` +
        `Please reply with 1 / 2 / 3 / 4 / 5.\n\n` +
        MAIN_MENU;
    }

    // Send reply
    await sendWhatsAppText(from, reply);

    console.log("✅ Auto-reply sent to:", from);
  } catch (err) {
    console.log("❌ Webhook error:", err?.response?.data || err.message);
  }
});

// Home route
app.get("/", (req, res) => {
  res.send("Shradha Hospital WhatsApp Bot Running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
