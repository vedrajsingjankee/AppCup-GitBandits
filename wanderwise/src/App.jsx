import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Destinations from './components/Destinations';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import ChatbotIcon from './components/ChatbotIcon';

export default function App() {
  const [dark, setDark] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col ${dark ? 'dark' : ''}`}>
      <Header dark={dark} setDark={setDark} />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Hero />
        <Destinations />
      </main>
      <Footer />
      <ChatbotIcon onClick={() => setShowChatbot((v) => !v)} />
      {showChatbot && (
        <div style={{
          position: 'fixed',
          bottom: '6rem',
          right: '2rem',
          zIndex: 1001,
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 8px 32px rgba(56,189,248,0.15)',
          width: '350px',
          maxWidth: '90vw',
          overflow: 'hidden',
        }}>
          <Chatbot onClose={() => setShowChatbot(false)} />
        </div>
      )}
    </div>
  );
}