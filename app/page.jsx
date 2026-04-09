'use client';

import { useState, useRef, useEffect } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Ahoj! Jsem Analise. Jak ti mohu pomoct?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const history = [...messages, { role: 'user', content: userMessage }];
    setMessages(history);
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages }),
      });

      if (!response.ok) throw new Error('Chyba serveru');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: updated[updated.length - 1].content + data.text,
                  };
                  return updated;
                });
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: 'Omlouvám se, nastala chyba. Zkus to prosím znovu.',
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={s.page}>
      {/* Messages */}
      <div style={s.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={msg.role === 'user' ? s.userRow : s.analiseRow}
          >
            {msg.role === 'user' ? (
              <div style={s.userBubble}>
                {msg.content}
              </div>
            ) : (
              <p style={s.analiseText}>
                {msg.content || (isLoading && i === messages.length - 1 ? '…' : '')}
              </p>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={s.inputWrapper}>
        <div style={s.inputBox}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Napiš zprávu Analise…"
            rows={1}
            style={s.textarea}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            style={{
              ...s.sendBtn,
              opacity: isLoading || !input.trim() ? 0.4 : 1,
              cursor: isLoading || !input.trim() ? 'default' : 'pointer',
            }}
            aria-label="Odeslat"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#ffffff',
  },

  /* ── Messages area ── */
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '32px 0 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  analiseRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    paddingLeft: '24px',
    paddingRight: '80px',
  },
  analiseText: {
    fontSize: '15px',
    lineHeight: '1.65',
    color: '#1a1a1a',
    maxWidth: '640px',
    whiteSpace: 'pre-wrap',
  },

  userRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingRight: '24px',
    paddingLeft: '80px',
  },
  userBubble: {
    backgroundColor: '#36227e',
    color: '#ffffff',
    padding: '10px 16px',
    borderRadius: '18px 18px 4px 18px',
    fontSize: '15px',
    lineHeight: '1.65',
    maxWidth: '640px',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  },

  /* ── Input area ── */
  inputWrapper: {
    padding: '12px 24px 28px',
    display: 'flex',
    justifyContent: 'center',
  },
  inputBox: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
    width: '100%',
    maxWidth: '720px',
    backgroundColor: '#f4f4f5',
    borderRadius: '18px',
    padding: '12px 14px 12px 18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  textarea: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    resize: 'none',
    outline: 'none',
    fontSize: '15px',
    lineHeight: '1.55',
    color: '#1a1a1a',
    fontFamily: 'inherit',
    minHeight: '24px',
    maxHeight: '160px',
    overflowY: 'auto',
  },
  sendBtn: {
    width: '34px',
    height: '34px',
    flexShrink: 0,
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#36227e',
    color: '#ffffff',
    fontSize: '17px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.15s',
  },
};
