// src/pages/SpecialistInbox.tsx
import React, { useState } from 'react';
import { mockRFPs } from '../data/mockData';
import { MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Clock } from 'lucide-react';

const SpecialistInbox = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  // === CRITICAL: Filter tasks based on the logged-in user's role ===
  // Only show tasks where 'waitingOn' matches their role.
  const myTasks = mockRFPs.filter(rfp => rfp.waitingOn === role);

  // Helper to display a nice title
  const roleTitle = role === 'tech' ? 'Technical Team' : role === 'pricing' ? 'Pricing Team' : 'Specialist';

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden">
      <h1 className="text-xl sm:text-2xl font-bold text-navy-900 mb-6">{roleTitle}: Pending Approvals</h1>

      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">RFP Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
                {myTasks.length > 0 ? (
                    myTasks.map((rfp) => (
                    <tr 
                      key={rfp.id} 
                      onClick={() => navigate(`/rfp/${rfp.id}`)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-navy-900">{rfp.client}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">{rfp.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                {rfp.deadline}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2 text-amber-600 font-medium">
                            <Clock size={16} />
                            <span>Ready for {rfp.currentStage} Review</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/rfp/${rfp.id}`} 
                          onClick={(e) => e.stopPropagation()}
                          className="text-teal-700 hover:text-teal-900 font-semibold flex items-center justify-end gap-1"
                        >
                            Review & Action
                        </Link>
                        </td>
                    </tr>
                    ))
                ) : (
                    // Empty state message
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                            <CheckCircle2 size={48} className="text-teal-500" />
                            <p className="text-lg font-medium">All caught up!</p>
                            <p className="text-sm">No pending approvals for the {roleTitle}.</p>
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};


const ChatbotPopup = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    // For step-by-step table generation
    const [tableRowsToShow, setTableRowsToShow] = useState(0);
  const [messages, setMessages] = useState([
    { sender: 'bot', type: 'text', content: 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [tableStep, setTableStep] = useState(0); // 0: nothing, 1: thinking, 2: table

  React.useEffect(() => {
    let thinkingTimer: NodeJS.Timeout | undefined;
    let tableTimer: NodeJS.Timeout | undefined;
    let rowTimers: NodeJS.Timeout[] = [];
    if (!open) {
      setMessages([{ sender: 'bot', type: 'text', content: 'Hi! How can I help you today?' }]);
      setInput('');
      setThinking(false);
      setTableStep(0);
      setTableRowsToShow(0);
      return;
    }
    if (tableStep === 1) {
      // Remove 'thinking' after a short delay, then show table after another delay
      thinkingTimer = setTimeout(() => {
        setMessages((prev) => prev.filter(msg => msg.type !== 'thinking'));
        tableTimer = setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { sender: 'bot', type: 'table', content: '' }
          ]);
          setTableStep(2);
          setTableRowsToShow(1); // Start with first row
        }, 600); // Delay before showing table
      }, 1000); // Duration of 'thinking' message
    }
    // Step-by-step row reveal
    if (tableStep === 2 && tableRowsToShow > 0 && tableRowsToShow < tableRows.length) {
      const nextRowTimer = setTimeout(() => {
        setTableRowsToShow((prev) => prev + 1);
      }, 400); // Delay between each row
      rowTimers.push(nextRowTimer);
    }
    return () => {
      if (thinkingTimer) clearTimeout(thinkingTimer);
      if (tableTimer) clearTimeout(tableTimer);
      rowTimers.forEach(timer => clearTimeout(timer));
    };
  }, [tableStep, open, tableRowsToShow]);

  if (!open) return null;

  // Demo data for "High Priority" query
  const tableRows = [
    { client: 'DMRC', title: 'Metro Phase 4 Cabling', value: '₹120 Cr', deadline: '2025-12-19', status: 'Tech Review' },
    { client: 'NHAI', title: 'Highway Expansion', value: '₹45 Cr', deadline: '2025-12-20', status: 'Pricing' },
    { client: 'NTPC', title: 'Solar Grid Project', value: '₹8.5 Cr', deadline: '2025-12-24', status: 'Final Review' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input.toLowerCase();
    setMessages((prev) => [
      ...prev,
      { sender: 'user', type: 'text', content: input }
    ]);
    setInput('');
    setThinking(true);

    // Demo Logic
    let responseType = 'text';
    let responseContent = "I'm not sure about that. Try asking for 'high priority RFPs' or the 'Metro Rail status'.";

    if (userMsg.includes('priority') || userMsg.includes('urgent') || userMsg.includes('list') || userMsg.includes('show')) {
        // Response 1: Table
        responseType = 'table';
        responseContent = 'Here are the high-priority RFPs closing this week:';
    } else if (userMsg.includes('status') || userMsg.includes('metro') || userMsg.includes('dmrc')) {
        // Response 2: Specific Text
        responseType = 'text';
        responseContent = "The **DMRC Metro Phase 4** bid is currently in **Tech Review**. Engineering has cleared the specs. We are waiting on the final compliance check before moving to Pricing. Win probability is currently **78%**.";
    }

    setMessages((prev) => [
      ...prev,
      { sender: 'bot', type: 'thinking', content: 'Analyzing pipeline...' }
    ]);
    
    // Simulate processing delay
    setTimeout(() => {
        setThinking(false);
        setMessages((prev) => prev.filter(msg => msg.type !== 'thinking'));
        
        // Add the intro text if it's a table, or just the text response
        if (responseType === 'table') {
             setMessages((prev) => [...prev, { sender: 'bot', type: 'text', content: responseContent }]);
             // Trigger table reveal
             setTableStep(1); // Re-trigger table animation logic
        } else {
             setMessages((prev) => [...prev, { sender: 'bot', type: 'text', content: responseContent }]);
        }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-end pointer-events-none">
      <div className="relative z-50 m-6 sm:m-12 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden pointer-events-auto animate-fadeInUp" style={{ minHeight: 500, maxHeight: 700 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shadow-sm">
          <span className="font-semibold text-lg flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-500/20 rounded-lg">
              <MessageCircle size={20} className="text-indigo-400" />
            </div>
            SwiftBid Assistant
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full">
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 px-6 py-6 overflow-y-auto bg-slate-50 space-y-4">
            {messages.map((msg, idx) => {
              if (msg.type === 'text') {
                return (
                  <div key={idx} className={`flex w-full ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'bot' 
                        ? 'bg-white text-slate-700 border border-slate-100 rounded-tl-none' 
                        : 'bg-indigo-600 text-white rounded-tr-none'
                    }`}>
                      {msg.content.split(/(\*\*.*?\*\*)/g).map((part, i) => 
                        part.startsWith('**') && part.endsWith('**') 
                          ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong> 
                          : <span key={i}>{part}</span>
                      )}
                    </div>
                  </div>
                );
              }
              if (msg.type === 'thinking') {
                return (
                  <div key={idx} className="flex justify-start w-full">
                    <div className="flex items-center gap-2 text-slate-500 px-4 py-3 rounded-2xl bg-white border border-slate-100 rounded-tl-none shadow-sm text-xs font-medium">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                      <span className="ml-1">{msg.content}</span>
                    </div>
                  </div>
                );
              }
              if (msg.type === 'table') {
                return (
                  <div key={idx} className="flex justify-start w-full">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-1 overflow-hidden shadow-sm max-w-full">
                      <div className="overflow-x-auto">
                        <table className="min-w-[400px] text-xs">
                          <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-slate-600">Client</th>
                              <th className="px-4 py-3 text-left font-semibold text-slate-600">Title</th>
                              <th className="px-4 py-3 text-left font-semibold text-slate-600">Value</th>
                              <th className="px-4 py-3 text-left font-semibold text-slate-600">Deadline</th>
                              <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {tableRows.slice(0, tableRowsToShow).map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-800">{row.client}</td>
                                <td className="px-4 py-3 text-slate-600">{row.title}</td>
                                <td className="px-4 py-3 font-medium text-slate-800">{row.value}</td>
                                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} className="text-amber-500"/>
                                        {row.deadline}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}
        </div>
        
        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form className="flex items-center gap-3" onSubmit={handleSubmit}>
            <input
              type="text"
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none bg-slate-50 transition-all placeholder:text-slate-400"
              placeholder="Ask about RFPs, pipeline status..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={thinking}
            />
            <button 
              type="submit" 
              className={`bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white p-3 rounded-xl transition-all shadow-sm hover:shadow ${thinking ? 'cursor-not-allowed opacity-70' : ''}`} 
              disabled={thinking}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.925A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.896 28.896 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.289Z" />
              </svg>
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400">AI can make mistakes. Verify important info.</p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

const FloatingChatbotButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="fixed z-50 bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-600/30 p-4 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 border-4 border-white ring-1 ring-slate-100"
    aria-label="Open Chatbot"
  >
    <MessageCircle size={28} />
  </button>
);

const SpecialistInboxWithChatbot = () => {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  return (
    <>
      <SpecialistInbox />
      {!chatbotOpen && <FloatingChatbotButton onClick={() => setChatbotOpen(true)} />}
      <ChatbotPopup open={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </>
  );
};

export default SpecialistInboxWithChatbot;
export { ChatbotPopup, FloatingChatbotButton };