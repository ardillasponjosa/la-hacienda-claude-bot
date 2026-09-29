const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Permite recibir JSON de Meta y otras APIs.
app.use(express.json());

// Ruta de prueba para comprobar que el servidor está funcionando.
app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "La Hacienda de Villa - Claude Bot",
    message: "Servidor funcionando correctamente."
  });
});

// Verificación de Webhook de Meta.
// Más adelante configuraremos META_VERIFY_TOKEN en Render.
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

// Aquí recibiremos posteriormente los mensajes de Instagram/Facebook.
app.post("/webhook", (req, res) => {
  console.log("Webhook recibido:", JSON.stringify(req.body, null, 2));

  // Respondemos rápidamente a Meta.
  res.sendStatus(200);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
