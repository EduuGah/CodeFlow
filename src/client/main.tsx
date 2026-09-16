import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { TemaProvider } from './contexts/TemaContext'
import './index.css'
import App from './App'

// Um `import()` que falha porque o deploy trocou os nomes dos arquivos — a
// aba ficou aberta de antes — vira uma recarga, uma vez só por sessão. Sem
// isto o editor de código caía na contingência (o textarea) até a pessoa
// recarregar por conta própria, sem saber por quê.
window.addEventListener('vite:preloadError', (evento) => {
  const CHAVE = 'codeflow:recarregou-por-chunk'
  let jaRecarregou = false
  try {
    jaRecarregou = sessionStorage.getItem(CHAVE) === '1'
    if (!jaRecarregou) sessionStorage.setItem(CHAVE, '1')
  } catch {
    // Sem sessionStorage (modo privado restrito): recarrega uma vez mesmo assim.
  }
  if (jaRecarregou) return
  evento.preventDefault()
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <TemaProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </TemaProvider>
    </ErrorBoundary>
  </StrictMode>,
)
