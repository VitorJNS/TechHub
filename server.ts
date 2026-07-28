import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load env variables
dotenv.config();

interface ChatMessage {
  id: string;
  sender: 'me' | 'contact';
  text: string;
  time: string;
  timestamp: number;
}

// In-memory store for WhatsApp messages (keyed by clean phone number)
// Since we don't have a database, we store messages in memory.
const whatsappHistories: Record<string, ChatMessage[]> = {};

function getCleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON request bodies
  app.use(express.json());

  // Log requests in development
  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
  });

  // 1. WhatsApp Config Endpoint
  app.get("/api/whatsapp/config", (req, res) => {
    const isConfigured = !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
    
    // Dynamically detect external host (e.g., ngrok tunnel or Cloud Run service URL)
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
    
    // Fallback to APP_URL if specified, otherwise build dynamically
    const webhookUrl = process.env.APP_URL 
      ? `${process.env.APP_URL}/api/whatsapp/webhook`
      : `${protocol}://${host}/api/whatsapp/webhook`;

    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'saleshub_token';

    res.json({
      isConfigured,
      webhookUrl,
      verifyToken,
      hasPhoneId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
      hasToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
    });
  });

  // 2. WhatsApp Send Message Endpoint
  app.post("/api/whatsapp/send", async (req: express.Request, res: express.Response) => {
    try {
      const { phone, text } = req.body;

      if (!phone || !text) {
        res.status(400).json({ error: "Telefone e texto são obrigatórios." });
        return;
      }

      const cleanPhone = getCleanPhoneNumber(phone);
      const token = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

      // Add to server-side memory history immediately
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const newMessage: ChatMessage = {
        id: `msg-server-sent-${Date.now()}`,
        sender: "me",
        text,
        time: formattedTime,
        timestamp: Date.now()
      };

      if (!whatsappHistories[cleanPhone]) {
        whatsappHistories[cleanPhone] = [];
      }
      whatsappHistories[cleanPhone].push(newMessage);

      // If credentials are not configured, simulate success with a notice
      if (!token || !phoneId) {
        console.log(`[WhatsApp Simulado] Para: ${cleanPhone} | Mensagem: ${text}`);
        res.json({
          success: true,
          simulated: true,
          message: "Mensagem salva no histórico simulado. Para enviar de verdade, configure as credenciais nas variáveis de ambiente.",
          data: newMessage
        });
        return;
      }

      // Prepare target phone with country code if missing (standard Brazilian numbers)
      let targetPhone = cleanPhone;
      if (targetPhone.length === 10 || targetPhone.length === 11) {
        targetPhone = "55" + targetPhone;
      }

      console.log(`[WhatsApp API Real] Enviando para: ${targetPhone}...`);

      // Make request to Meta WhatsApp Cloud API
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: targetPhone,
            type: "text",
            text: {
              preview_url: false,
              body: text
            }
          })
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        console.error("[WhatsApp API Erro]", responseData);
        res.status(response.status).json({
          success: false,
          error: "API_ERROR",
          message: responseData.error?.message || "Erro retornado pela API do WhatsApp.",
          details: responseData
        });
        return;
      }

      res.json({
        success: true,
        simulated: false,
        message: "Mensagem enviada com sucesso pelo WhatsApp Cloud API!",
        details: responseData,
        data: newMessage
      });

    } catch (error: any) {
      console.error("[WhatsApp Send Handler Exception]", error);
      res.status(500).json({
        success: false,
        error: "SERVER_EXCEPTION",
        message: error.message || "Erro interno ao processar disparo de WhatsApp."
      });
    }
  });

  // 3. WhatsApp Message History Endpoint
  app.get("/api/whatsapp/history", (req, res) => {
    const { phone } = req.query;
    if (!phone) {
      res.status(400).json({ error: "Parâmetro phone é obrigatório." });
      return;
    }

    const cleanPhone = getCleanPhoneNumber(phone as string);
    const history = whatsappHistories[cleanPhone] || [];
    res.json({ history });
  });

  // 4. WhatsApp Webhook - GET (Verification Challenge)
  app.get("/api/whatsapp/webhook", (req, res) => {
    console.log("[WhatsApp Webhook GET Query]", JSON.stringify(req.query));

    // Support both flat query (hub.mode) and nested query parsed by qs (hub: { mode })
    const mode = req.query["hub.mode"] || (req.query.hub as any)?.mode;
    const token = req.query["hub.verify_token"] || (req.query.hub as any)?.verify_token;
    const challenge = req.query["hub.challenge"] || (req.query.hub as any)?.challenge;

    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'saleshub_token';

    console.log(`[WhatsApp Webhook Verification] Mode: ${mode}, Token: ${token}, Challenge: ${challenge}. Expected Verify Token: ${verifyToken}`);

    if (mode && token) {
      if (mode === "subscribe" && token === verifyToken) {
        console.log("[WhatsApp Webhook] Verificação concluída com sucesso! Respondendo com challenge.");
        // Ensure we send it as a plain string, not as a numeric status code
        res.status(200).send(String(challenge));
      } else {
        console.warn("[WhatsApp Webhook] Falha de verificação do token! Token incorreto.");
        res.status(403).send("Verification token mismatch");
      }
    } else {
      console.warn("[WhatsApp Webhook] Parâmetros de verificação inválidos ou ausentes.");
      res.status(400).send("Invalid verification request");
    }
  });

  // 5. WhatsApp Webhook - POST (Receive Message events)
  app.post("/api/whatsapp/webhook", (req, res) => {
    try {
      const body = req.body;

      if (body.object === "whatsapp_business_account") {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const messages = value?.messages;

        if (messages && messages.length > 0) {
          for (const message of messages) {
            const from = message.from; // Sender's phone number
            const text = message.text?.body;
            const type = message.type;

            if (type === "text" && text) {
              const cleanPhone = getCleanPhoneNumber(from);
              const now = new Date();
              const formattedTime = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

              const incomingMsg: ChatMessage = {
                id: message.id || `msg-webhook-recv-${Date.now()}`,
                sender: "contact",
                text,
                time: formattedTime,
                timestamp: Date.now()
              };

              if (!whatsappHistories[cleanPhone]) {
                whatsappHistories[cleanPhone] = [];
              }
              whatsappHistories[cleanPhone].push(incomingMsg);
              console.log(`[WhatsApp Webhook Recebido] De: ${cleanPhone} | Conteúdo: ${text}`);
            }
          }
        }
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    } catch (err) {
      console.error("[WhatsApp Webhook Error]", err);
      res.sendStatus(500);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        allowedHosts: true
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
