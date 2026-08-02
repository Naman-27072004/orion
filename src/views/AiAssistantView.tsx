import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Bot, Send, Sparkles, Cpu, ShieldCheck, Battery, RefreshCw } from 'lucide-react';
import { AiResponse } from '../types/orion';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  source?: string;
  timestamp: string;
}

export const AiAssistantView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your Orion Diagnostic Assistant. Ask me anything about system thermals, battery wear, RAM optimization, or hardware security status.',
      source: 'Orion System AI Core',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setPrompt('');
    setLoading(true);

    try {
      const res = await invoke<AiResponse>('ask_ai_assistant', { prompt: textToSend });
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.response,
        source: res.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'System diagnostic lookup failed. Please ensure local service parameters are operational.',
        source: 'Orion Diagnostic Engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-white/10 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            Orion AI Diagnostic Assistant
          </h2>
          <p className="text-xs text-gray-400">
            Real-time System Intelligence & Local LLM Diagnostic Companion
          </p>
        </div>
        <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl text-xs text-cyan-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Local Engine Active</span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => handleSend('Diagnose CPU & Thermal Status')}
          className="glass-panel p-3 rounded-xl border border-white/10 hover:border-cyan-500/40 text-left transition-all group"
        >
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
            <Cpu className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>CPU & Thermals</span>
          </div>
          <p className="text-[11px] text-gray-400">Check Snapdragon clock & temperatures</p>
        </button>

        <button
          onClick={() => handleSend('Analyze RAM working set and cache')}
          className="glass-panel p-3 rounded-xl border border-white/10 hover:border-blue-500/40 text-left transition-all group"
        >
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold mb-1">
            <RefreshCw className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>RAM Optimization</span>
          </div>
          <p className="text-[11px] text-gray-400">Inspect working set & memory health</p>
        </button>

        <button
          onClick={() => handleSend('Check Battery Wear and Runtime Forecast')}
          className="glass-panel p-3 rounded-xl border border-white/10 hover:border-emerald-500/40 text-left transition-all group"
        >
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
            <Battery className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Battery Forecast</span>
          </div>
          <p className="text-[11px] text-gray-400">1-year wear & discharge estimate</p>
        </button>

        <button
          onClick={() => handleSend('Hardware Security & Defender Audit')}
          className="glass-panel p-3 rounded-xl border border-white/10 hover:border-purple-500/40 text-left transition-all group"
        >
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Security Audit</span>
          </div>
          <p className="text-[11px] text-gray-400">Pluton TPM & BitLocker check</p>
        </button>
      </div>

      {/* Chat Conversation Box */}
      <div className="glass-panel rounded-2xl border border-white/10 p-4 h-[420px] flex flex-col justify-between">
        <div className="overflow-y-auto space-y-4 pr-2 flex-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-300">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] opacity-60">
                  <span>{msg.source || 'User'}</span>
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 p-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing system telemetry metrics...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="mt-4 pt-3 border-t border-white/10 flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Orion AI about system performance, battery health, or security..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !prompt.trim()}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 font-semibold text-xs text-white shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
