
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserProfile, ChatMessage, GroundingSource } from '../types';
import { getAIChatResponse } from '../services/geminiService';
import { Icons } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import LoadingSpinner from '../components/LoadingSpinner';

interface AIChatPageProps {
  activeProfile: UserProfile | undefined;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const AIChatPage: React.FC<AIChatPageProps> = ({ activeProfile, chatMessages, setChatMessages }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatMessages]);
  
  const handleSendMessage = useCallback(async () => {
    if (input.trim() === '') return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Pass recent history for context, limit to last N messages
      const historyLimit = 10;
      const recentHistory = chatMessages.slice(-historyLimit);

      const aiResponse = await getAIChatResponse(input, activeProfile, recentHistory);
      
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'ai',
        text: aiResponse.text,
        sources: aiResponse.sources,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'ai',
        text: "Sorry, I couldn't process your request right now. Please try again later.",
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, activeProfile, setChatMessages]); // chatMessages removed to prevent re-creation of handleSendMessage on every message. Context is passed explicitly.

  const renderMessageText = (text: string) => {
    // Basic markdown-like link detection [text](url)
    const linkRegex = /\[([^\]]+)]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts;
  };


  return (
    <div className="container mx-auto p-4 flex flex-col h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)]"> {/* Adjust height as needed */}
      <h1 className="text-3xl font-bold text-dark mb-6 flex items-center">
        <Icons.Sparkles className="w-8 h-8 mr-3 text-primary" /> AI Diet Coach
      </h1>
      {activeProfile && (
        <p className="text-sm text-gray-600 mb-4 bg-yellow-50 p-2 rounded-md">
          Chatting as: <span className="font-semibold text-primary">{activeProfile.name}</span>. Your profile details may be used to personalize advice.
        </p>
      )}
      {!activeProfile && (
         <p className="text-sm text-gray-600 mb-4 bg-yellow-100 p-3 rounded-md border border-yellow-300">
          <Icons.Alert className="w-5 h-5 inline mr-2 text-yellow-600" />
          No active profile selected. Responses will be general. Select a profile for personalized advice.
        </p>
      )}

      <div className="flex-grow overflow-y-auto bg-white shadow-inner rounded-lg p-4 mb-4 space-y-4">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl p-3 rounded-lg shadow ${
              msg.sender === 'user' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-dark'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{renderMessageText(msg.text)}</p>
              {msg.sender === 'ai' && msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <p className="text-xs font-semibold mb-1">Sources:</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    {msg.sources.map((source, idx) => source.web && (
                      <li key={idx}>
                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">
                          {source.web.title || source.web.uri}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-gray-200' : 'text-gray-500'}`}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="max-w-xs p-3 rounded-lg shadow bg-gray-100 text-dark">
                    <LoadingSpinner size="sm"/>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder="Ask anything about food, nutrition, or your plan..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || input.trim() === ''}
            className="bg-primary text-white px-6 py-2.5 rounded-lg shadow hover:bg-green-600 transition disabled:opacity-50 flex items-center"
          >
            Send <Icons.Sparkles className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
