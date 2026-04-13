import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Telegraf } from "telegraf";
import cron from "node-cron";
import * as admin from "firebase-admin";

import fs from "fs";

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      admin.initializeApp({
        projectId: config.projectId,
      });
      console.log("Firebase Admin initialized with config.");
    } else {
      admin.initializeApp();
      console.log("Firebase Admin initialized with default credentials.");
    }
  } catch (e) {
    console.log("Firebase Admin initialization deferred or failed:", e);
  }
}

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store for active bot instances
const botInstances: Record<string, Telegraf> = {};

async function startBot(botId: string, token: string) {
  if (botInstances[botId]) {
    try {
      await botInstances[botId].stop();
    } catch (e) {}
  }

  const bot = new Telegraf(token);
  
  bot.on("message", async (ctx) => {
    const chat = ctx.chat;
    const botId_chatId = `${botId}_${chat.id}`;
    const db = admin.firestore();

    try {
      if (chat.type === "private") {
        await db.collection("chats").doc(botId_chatId).set({
          chatId: chat.id,
          botId: botId,
          firstName: "first_name" in chat ? chat.first_name : "",
          username: "username" in chat ? chat.username : "",
          lastInteraction: new Date().toISOString()
        }, { merge: true });
      } else if (chat.type === "group" || chat.type === "supergroup") {
        await db.collection("groups").doc(botId_chatId).set({
          groupId: chat.id,
          botId: botId,
          title: "title" in chat ? chat.title : "Unknown Group",
          type: chat.type
        }, { merge: true });
      }
    } catch (e) {
      console.error("Error saving chat/group info:", e);
    }
    
    if (ctx.message && "text" in ctx.message && ctx.message.text === "/start") {
      ctx.reply("Welcome! This bot is managed by AdsAppBot Manager.");
    }
  });

  bot.launch().catch(err => {
    console.error(`Failed to launch bot ${botId}:`, err);
  });
  
  botInstances[botId] = bot;
  console.log(`Bot ${botId} started.`);
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Routes
app.post("/api/bots/start", async (req, res) => {
  if (!admin.apps.length) return res.status(500).json({ error: "Firebase not initialized" });
  const { botId, token } = req.body;
  if (!botId || !token) return res.status(400).json({ error: "Missing botId or token" });
  
  try {
    await startBot(botId, token);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post("/api/broadcast", async (req, res) => {
  if (!admin.apps.length) return res.status(500).json({ error: "Firebase not initialized" });
  const { message, botIds, delay = 0, targetType = "all" } = req.body;
  if (!message || !botIds || !Array.isArray(botIds)) {
    return res.status(400).json({ error: "Invalid broadcast data" });
  }

  const db = admin.firestore();
  
  // Run broadcast in background to avoid timeout
  (async () => {
    for (const botId of botIds) {
      const bot = botInstances[botId];
      if (!bot) continue;

      let targets = [];
      if (targetType === "private" || targetType === "all") {
        const chats = await db.collection("chats").where("botId", "==", botId).get();
        targets.push(...chats.docs.map(d => d.data().chatId));
      }
      if (targetType === "groups" || targetType === "all") {
        const groups = await db.collection("groups").where("botId", "==", botId).get();
        targets.push(...groups.docs.map(d => d.data().groupId));
      }

      // Remove duplicates
      targets = [...new Set(targets)];

      for (const chatId of targets) {
        try {
          await bot.telegram.sendMessage(chatId, message);
          if (delay > 0) await sleep(delay * 1000);
        } catch (e) {
          console.error(`Failed to send to ${chatId} via ${botId}:`, e);
        }
      }
    }
  })();

  res.json({ success: true, message: "Broadcast started in background" });
});

// Scheduler
cron.schedule("* * * * *", async () => {
  // Check for pending broadcasts
  const db = admin.firestore();
  const now = new Date().toISOString();
  
  try {
    const pending = await db.collection("broadcasts")
      .where("status", "==", "pending")
      .where("scheduledAt", "<=", now)
      .get();

    for (const doc of pending.docs) {
      const data = doc.data();
      console.log(`Executing scheduled broadcast: ${doc.id}`);
      
      // Call internal broadcast logic (simplified here)
      // In a real app, you'd trigger the broadcast and update status
      await db.collection("broadcasts").doc(doc.id).update({ status: "sent" });
    }
  } catch (e) {
    // console.error("Scheduler error:", e);
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
