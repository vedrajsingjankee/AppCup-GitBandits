import React from 'react';

const iconStyle = {
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  zIndex: 1000,
  background: 'linear-gradient(135deg, #38bdf8 60%, #6366f1 100%)',
  borderRadius: '50%',
  width: '64px',
  height: '64px',
  boxShadow: '0 4px 24px rgba(56,189,248,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  border: 'none',
};

export default function ChatbotIcon({ onClick }) {
  return (
    <button style={iconStyle} onClick={onClick} aria-label="Open AI Chatbot">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#fff" />
        <path d="M8 10h8M8 14h5" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="17" cy="14" r="1" fill="#6366f1"/>
      </svg>
    </button>
  );
}