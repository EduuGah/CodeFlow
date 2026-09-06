import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware para parser de JSON
  app.use(express.json());

  // Initialize Gemini Client
  // It uses process.env.GEMINI_API_KEY automatically if we pass it explicitly or it grabs it from env.
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY,
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
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "O corpo da requisição precisa conter um array 'messages'." });
      }

      // Convertendo o formato das mensagens do front para o modelo (text string para o chat)
      // Usaremos o recurso de chat para manter o histórico
      const chat = ai.chats.create({
        model: "gemini-3.8-flash",
        config: {
          systemInstruction: `Você é um Tutor de Programação Socrático para a plataforma CodeFlow. 
REGRAS OBRIGATÓRIAS:
1. NUNCA, SOB NENHUMA HIPÓTESE, entregue o código ou a resposta pronta.
2. Seu papel é fazer perguntas que guiem o raciocínio do aluno até a resposta.
3. Se o aluno pedir a resposta, recuse educadamente e dê uma dica sobre qual conceito ele deve revisar.
4. Mantenha as mensagens extremamente curtas e diretas. Evite textos longos.
5. Você tem acesso ao código atual do aluno no momento: \n\`\`\`javascript\n${codeContext || 'Nenhum código no editor.'}\n\`\`\`\nUse isso para dar contexto às suas dicas.`,
        }
      });

      // No @google/genai, pra mandar histórico podemos criar um chat, mas como a API cria o chat do zero aqui,
      // precisamos apenas mandar todas as mensagens passadas? 
      // A API SDK @google/genai permite passar history na criação do chat:
      // O código acima criaria um chat em branco. Vamos usar ai.models.generateContent em vez de chat
      // para passar todo o histórico formatado na request manual.
      
      const contents = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
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
