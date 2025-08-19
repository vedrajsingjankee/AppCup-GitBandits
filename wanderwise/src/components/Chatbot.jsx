import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '../ai/chatbotService';

// Simple SVG Icons
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const BotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 8V4H8"></path>
    <rect width="16" height="12" x="4" y="8" rx="2"></rect>
    <path d="M2 14h2"></path>
    <path d="M20 14h2"></path>
    <path d="M15 13v2"></path>
    <path d="M9 13v2"></path>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const PlaneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.2-.1.3-.5.1-1z"></path>
  </svg>
);

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: '🌍 Hi traveler! I\'m your WanderWise travel assistant. Ask me about destinations, flights, hotels, or travel tips!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const userMsg = { from: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    
    try {
      // Add travel context to the query
      const travelContext = "You are a travel and tourism expert. Only answer questions related to travel, tourism, destinations, flights, hotels, attractions, travel tips, and vacation planning. For any non-travel questions, politely redirect the user to travel-related topics.";
      const travelQuery = `${travelContext} User: ${input}`;
      
      const reply = await getChatbotResponse(travelQuery);
      setMessages((msgs) => [...msgs, { from: 'bot', text: reply }]);
    } catch (error) {
      setMessages((msgs) => [...msgs, { from: 'bot', text: '✈️ Sorry, I encountered an error. Please ask me about travel destinations, flights, or tourism tips!' }]);
    } finally {
      setLoading(false);
    }
  };

  // Travel quick actions
  const quickActions = [
    "Best beach destinations?",
    "Budget travel tips?",
    "Family-friendly hotels?",
    "Popular travel seasons?"
  ];

  const handleQuickAction = (action) => {
    setInput(action);
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-xl overflow-hidden border border-blue-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-blue-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-full">
            <PlaneIcon />
          </div>
          <span className="font-bold text-blue-600">WanderWise Travel Assistant</span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <XIcon />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[85%] ${msg.from === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.from === 'user' 
                  ? 'bg-blue-500' 
                  : 'bg-cyan-500'
              }`}>
                {msg.from === 'user' ? (
                  <UserIcon />
                ) : (
                  <BotIcon />
                )}
              </div>
              
              {/* Message Bubble */}
              <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                msg.from === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-white text-gray-700 border border-gray-200 rounded-bl-md'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center">
                <BotIcon />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                  className="text-xs bg-white border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50 text-blue-600 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form 
        onSubmit={sendMessage} 
        className="p-4 bg-white border-t border-blue-100"
      >
        <div className="flex space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about destinations, flights, hotels..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-sm"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-full p-3 transition-colors flex items-center justify-center"
          >
            <SendIcon />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          ✈️ Specialized in travel & tourism assistance
        </p>
      </form>
    </div>
  );
}