import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Nem o tsx (dev) nem o node (produção) leem o .env sozinhos. Sem isto,
// process.env.GEMINI_API_KEY fica undefined e o SDK do Gemini cai no fluxo de
// Application Default Credentials, falhando com um erro que não menciona a chave.
// process.loadEnvFile é nativo do Node 20.12+ — não precisa de dependência.
try {
  process.loadEnvFile();
} catch {
  // Em produção as variáveis costumam vir do próprio host, sem arquivo .env.
}

const TUTOR_MODEL = "gemini-3.8-flash";

/** 503/UNAVAILABLE e 429/RESOURCE_EXHAUSTED sao picos temporarios do provedor. */
function isOverloaded(error: unknown): boolean {
  const status = (error as { status?: number })?.status;
  if (status === 503 || status === 429) return true;

  const message = error instanceof Error ? error.message : String(error);
  return /"code":\s*(503|429)|UNAVAILABLE|RESOURCE_EXHAUSTED/.test(message);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware para parser de JSON
  app.use(express.json());

  /**
   * Chama o Gemini reservando novas tentativas apenas para sobrecarga temporária.
   * Erros de request (400, 404) falham de imediato: repetir não muda o resultado.
   */
  async function generateWithRetry(
    params: Parameters<typeof ai.models.generateContent>[0],
    tentativas = 3
  ) {
    let ultimoErro: unknown;

    for (let i = 0; i < tentativas; i++) {
      try {
        return await ai.models.generateContent(params);
      } catch (error) {
        ultimoErro = error;
        if (!isOverloaded(error) || i === tentativas - 1) throw error;

        // Backoff exponencial: 500ms, 1s, 2s…
        await sleep(500 * 2 ** i);
      }
    }

    throw ultimoErro;
  }

  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();

  if (!geminiApiKey) {
    console.warn(
      "[CodeFlow] GEMINI_API_KEY ausente: o Tutor IA responderá com erro até a chave ser definida no .env."
    );
  }

  const ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Rotas da API (Devem ser registradas ANTES do middleware do Vite)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "CodeFlow API is running" });
  });

  // Rota do Tutor IA (Fase 15)
  app.post("/api/tutor", async (req, res) => {
    try {
      const { messages, codeContext } = req.body;

      if (!geminiApiKey) {
        return res.status(503).json({
          error: "Tutor IA indisponível: defina GEMINI_API_KEY no arquivo .env e reinicie o servidor.",
        });
      }

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "O corpo da requisição precisa conter um array 'messages'." });
      }

      const contents = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await generateWithRetry({
        model: TUTOR_MODEL,
        contents,
        config: {
          systemInstruction: `Você é um Tutor de Programação Socrático para a plataforma CodeFlow. 
REGRAS OBRIGATÓRIAS:
1. NUNCA, SOB NENHUMA HIPÓTESE, entregue o código final ou a resposta pronta.
2. Seu papel é fazer perguntas que guiem o raciocínio do aluno até a resposta.
3. Se o aluno pedir a resposta, recuse educadamente e dê uma dica sobre qual conceito ele deve revisar.
4. Mantenha as respostas curtas, como num chat rápido (1 a 3 frases).
5. O aluno está atualmente com este código no editor: \n\`\`\`javascript\n${codeContext || 'Vazio'}\n\`\`\`\nUse isso para dar dicas pontuais baseadas nos erros visíveis.`,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("Erro no Tutor IA:", error);

      // 503/429 persistente é sobrecarga do provedor, não erro do aluno nem bug nosso.
      if (isOverloaded(error)) {
        return res.status(503).json({
          error: "O tutor está com muita demanda no momento. Tente de novo em alguns segundos.",
          retryable: true,
        });
      }

      res.status(500).json({ error: "Ocorreu um erro ao consultar o Tutor IA." });
    }
  });

  // Vite middleware para desenvolvimento ou arquivos estáticos para produção
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
    console.log(`🚀 CodeFlow Server running on port ${PORT}`);
  });
}

startServer();
