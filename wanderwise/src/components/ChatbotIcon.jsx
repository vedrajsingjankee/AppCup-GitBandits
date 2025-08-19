import React from 'react';

export default function ChatbotIcon({ onClick, showOptions, onOptionSelect }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div className="chatbot-icon-container" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50 }}>
      {showOptions && (
        <div className="chatbot-options" style={{
          position: 'absolute',
          bottom: '80px',
          right: 0,
          background: 'white',
          borderRadius: '12px',
          padding: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          zIndex: 49,
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <button 
            className="option-button"
            onClick={() => onOptionSelect('chat')}
            aria-label="Open Chat"
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 16px',
              margin: '4px 0',
              border: 'none',
              borderRadius: '8px',
              background: '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e0e7ff';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            💬 Chat Assistant
          </button>
          <button 
            className="option-button sos"
            onClick={() => onOptionSelect('sos')}
            aria-label="Emergency SOS"
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 16px',
              margin: '4px 0',
              border: 'none',
              borderRadius: '8px',
              background: '#fee2e2',
              color: '#dc2626',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fecaca';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            🆘 SOS Emergency
          </button>
        </div>
      )}
      
      <button
        onClick={onClick}
        aria-label="Open Assistant"
        className="flex items-center justify-center"
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
          aria-label="assistant"
        >
          {showOptions ? '✕' : '💬'}
        </span>
      </button>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}