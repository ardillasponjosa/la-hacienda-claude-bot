const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Conexión con Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultHeaders: {
    "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID
  }
});

// Ruta principal
app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "La Hacienda de Villa - Claude Bot",
    message: "Servidor funcionando correctamente."
  });
});

// Prueba de conexión con Claude
app.get("/claude", async (req, res) => {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: "Hola Claude, responde brevemente confirmando que estás conectado con el asistente de La Hacienda de Villa."
        }
      ]
    });

    res.json({
      ok: true,
      response: message.content[0].text
    });

  } catch (error) {
    console.error("Error de Claude:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudo conectar con Claude."
    });
  }
});

// Verificación del Webhook de Meta
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token &&
    token === process.env.META_VERIFY_TOKEN
  ) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Recepción de mensajes de Meta
app.post("/webhook", (req, res) => {
  console.log(
    "Webhook recibido:",
    JSON.stringify(req.body, null, 2)
  );

  res.sendStatus(200);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
