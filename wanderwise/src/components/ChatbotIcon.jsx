import React from 'react';

export default function ChatbotIcon({ onClick }) {
  const [hovered, setHovered] = React.useState(false);

  return (
      <button
      onClick={onClick}
        aria-label="Open Chatbot"
      className="fixed bottom-8 right-8 z-50 flex items-center justify-center"
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: hovered
            ? 'linear-gradient(120deg, #38bdf8 60%, #2563eb 100%)'
            : 'linear-gradient(120deg, #2563eb 60%, #38bdf8 100%)',
          boxShadow: hovered
            ? '0 8px 32px #38bdf855, 0 2px 8px #2563eb33'
            : '0 4px 16px #2563eb33',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          transition:
            'background 0.25s cubic-bezier(.4,2,.6,1), box-shadow 0.25s cubic-bezier(.4,2,.6,1), transform 0.25s cubic-bezier(.4,2,.6,1)',
          transform: hovered
            ? 'scale(1.09) translateY(-4px) rotate(-6deg)'
            : 'scale(1) translateY(0) rotate(0deg)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span
          style={{
            fontSize: 32,
            transition: 'transform 0.25s cubic-bezier(.4,2,.6,1)',
            transform: hovered ? 'scale(1.18) rotate(8deg)' : 'scale(1) rotate(0deg)',
            filter: hovered ? 'drop-shadow(0 2px 8px #fffbe6cc)' : 'none',
          }}
          role="img"
          aria-label="chat"
        >
          💬
        </span>
      </button>
  );
}