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

// Ver modelos disponibles
app.get("/models", async (req, res) => {
  try {
    const models = await anthropic.models.list();

    res.json({
      ok: true,
      models: models.data.map(model => ({
        id: model.id,
        name: model.display_name
      }))
    });
  } catch (error) {
    console.error("Error obteniendo modelos:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudieron obtener los modelos."
    });
  }
});

// Prueba de conexión con Claude
app.get("/claude", async (req, res) => {
  try {
    const pregunta =
      req.query.pregunta || "Hola, ¿puedes presentarte brevemente?";

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,

      system: `
Eres el asistente virtual de La Hacienda de Villa, un salón de eventos.

Tu función es atender de manera amable, clara, natural y profesional a las personas interesadas en conocer o contratar el salón.

INFORMACIÓN DE LA HACIENDA DE VILLA:

La fecha puede apartarse con $500 pesos.

CAPACIDADES Y PRECIOS:
- 100 personas: $43,000
- 150 personas: $53,500
- 200 personas: $64,000
- 250 personas: $69,000
- El aforo máximo es de 250 personas.

EL PAQUETE INCLUYE:
- Renta del salón
- 5 horas de evento
- Mesas redondas
- Banquete a 3 tiempos
- Servicio de meseros y capitán de meseros
- Silla Tiffany
- Mantel y manteleta
- Loza y cristalería
- Servicio de cocina
- Refresco y hielo continuo
- Descorche de botella ¾ o 12 pack por mesa
- Audio e iluminación
- DJ de casa
- Confortable lobby para ceremonia civil
- Clima
- Vigilancia
- Estacionamiento
- Permiso de Presidencia

NO INCLUYE:
- Centros de mesa
- Arreglo del salón
- Bebidas alcohólicas

HORARIOS DE ATENCIÓN Y VISITAS:
- Lunes a jueves: 10:30 a. m. a 4:30 p. m.
- Viernes: 10:30 a. m. a 5:00 p. m.
- Sábado: 8:00 a. m. a 2:00 p. m.

Las visitas al salón se realizan con cita.

REGLAS IMPORTANTES:
- Responde únicamente con la información proporcionada en estas instrucciones.
- No inventes precios, servicios, disponibilidad, horarios ni condiciones.
- Si una persona pregunta algo que no aparece aquí, indica amablemente que necesitas confirmarlo con el equipo de La Hacienda de Villa.
- No confirmes citas ni fechas por tu cuenta. Puedes ayudar a orientar al cliente para solicitar una visita, pero la confirmación final la realiza el equipo de La Hacienda de Villa.
- Mantén las respuestas breves, cálidas, naturales y profesionales.
- Adapta tus respuestas a lo que el cliente esté preguntando; no muestres toda la información de golpe.
- No menciones que eres una inteligencia artificial a menos que el cliente lo pregunte directamente.
`,

      messages: [
        {
          role: "user",
          content: pregunta
        }
      ]
    });

    res.json({
      ok: true,
      pregunta: pregunta,
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

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
