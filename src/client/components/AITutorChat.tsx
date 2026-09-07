import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';

interface Message {
  role: 'user' | 'model';
  text: string;
  /** Falha da API, renderizada em tom de aviso em vez de resposta do tutor. */
  isError?: boolean;
}

export function AITutorChat({ codeContext }: { codeContext: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou seu Tutor IA. Como posso te guiar neste código hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          codeContext
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // O servidor manda uma mensagem específica (sobrecarga, chave ausente…).
        // Mostrar "problemas de conexão" para tudo esconde a causa real do aluno.
        throw new Error(data?.error ?? 'Não consegui falar com o tutor agora.');
      }

      setMessages(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Não consegui falar com o tutor agora.';
      setMessages(prev => [...prev, { role: 'model', text, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105 z-50"
          title="Falar com Tutor IA"
        >
          <Bot size={28} />
        </button>
      )}

      {/* Janela de Chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white border border-zinc-200 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="h-14 bg-indigo-600 text-white flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-semibold text-sm">Tutor IA (Socrático)</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 h-80 overflow-y-auto p-4 flex flex-col gap-3 bg-zinc-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : msg.isError
                        ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-bl-sm'
                        : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-zinc-200 text-zinc-500 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-xs font-medium">Pensando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-zinc-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte algo sobre o código..."
              className="flex-1 text-sm bg-zinc-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-2 outline-none transition-all"
            />
            <Button size="sm" onClick={handleSend} disabled={!input.trim() || isLoading} className="bg-indigo-600 hover:bg-indigo-700 w-10 h-10 p-0 flex items-center justify-center rounded-xl">
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
