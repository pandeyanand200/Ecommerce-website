import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi';
import api from '../utils/api';

const AIChat = () => {
  const [isOpen, setIsOpen] = isOpenState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your AI shopping assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Handle opening and closing the chat
  function isOpenState(initial) {
    return useState(initial);
  }

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post('/api/ai/chat', { message: userMessage });
      
      if (response.data.success) {
        setMessages(prev => [...prev, { text: response.data.reply, isBot: true }]);
      } else {
        setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", isBot: true }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { text: "Sorry, I couldn't reach the server. Please try again later.", isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105 flex items-center justify-center animate-bounce"
        >
          <FiMessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] border border-gray-200 overflow-hidden transform transition-all">
          {/* Header */}
          <div className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-lg">AI Support</h3>
            </div>
            <button onClick={toggleChat} className="text-white hover:text-gray-200 transition-colors">
              <FiX size={24} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-4">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.isBot 
                    ? 'bg-white text-gray-800 self-start border border-gray-100 rounded-tl-sm' 
                    : 'bg-indigo-600 text-white self-end rounded-tr-sm'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="bg-white text-gray-500 self-start p-3 rounded-2xl rounded-tl-sm text-sm border border-gray-100 shadow-sm flex items-center space-x-2 w-16 h-10">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-gray-100 focus:bg-white border border-gray-200 focus:border-indigo-500 rounded-full px-4 py-2 outline-none transition-colors text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                !input.trim() || isLoading 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
              }`}
            >
              <FiSend size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChat;
