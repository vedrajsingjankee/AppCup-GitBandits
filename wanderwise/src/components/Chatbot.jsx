import React, { useState } from 'react';
import { getChatbotResponse } from '../ai/chatbotService';

export default function Chatbot({ onClose }) {
const [messages, setMessages] = useState([
  { from: 'bot', text: 'Hi! I\'m WanderWise, your AI travel buddy. Ask me anything!' }
]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const reply = await getChatbotResponse(input);
      setMessages((msgs) => [...msgs, { from: 'bot', text: reply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f0f9ff 60%, #e0e7ff 100%)',
      minHeight: 400,
      display: 'flex',
      flexDirection: 'column',
      height: 400,
      width: '100%',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e0e7ef' }}>
        <span style={{ fontWeight: 700, color: '#38bdf8' }}>AI Chatbot</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6366f1'
        }} aria-label="Close">×</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: 12,
            textAlign: msg.from === 'user' ? 'right' : 'left'
          }}>
            <span style={{
              display: 'inline-block',
              background: msg.from === 'user' ? '#38bdf8' : '#fff',
              color: msg.from === 'user' ? '#fff' : '#6366f1',
              borderRadius: 16,
              padding: '8px 14px',
              maxWidth: '80%',
              boxShadow: msg.from === 'user' ? '0 2px 8px #38bdf833' : '0 2px 8px #6366f133'
            }}>
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <div style={{ color: '#6366f1' }}>Thinking...</div>}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', borderTop: '1px solid #e0e7ef', padding: '0.5rem' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            padding: '0.75rem',
            borderRadius: 12,
            fontSize: 16,
            background: '#f8fafc',
            marginRight: 8,
          }}
        />
        <button type="submit" disabled={loading} style={{
          background: '#38bdf8',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '0.75rem 1.25rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}>Send</button>
      </form>
    </div>
  );
}
