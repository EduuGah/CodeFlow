import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Nem o tsx (dev) nem o node (produção) leem o .env sozinhos. Mantido aqui
// porque qualquer variável de servidor futura vai precisar disto.
// process.loadEnvFile é nativo do Node 20.12+ — não precisa de dependência.
try {
  process.loadEnvFile();
} catch {
  // Em produção as variáveis costumam vir do próprio host, sem arquivo .env.
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware para parser de JSON
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "CodeFlow API is running" });
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
