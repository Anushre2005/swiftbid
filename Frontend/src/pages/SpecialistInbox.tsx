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

  // Hardcoded table data for December product purchase RFPs
  const tableRows = [
    { client: 'Acme Corp', title: 'Laptop Purchase', value: '₹1,20,000', deadline: '2025-12-10', status: 'In Review' },
    { client: 'Beta Ltd', title: 'Printer Supplies', value: '₹18,500', deadline: '2025-12-15', status: 'Approved' },
    { client: 'Gamma Inc', title: 'Desktop PCs', value: '₹75,000', deadline: '2025-12-20', status: 'Pending' },
    { client: 'Delta LLC', title: 'Monitors', value: '₹32,000', deadline: '2025-12-22', status: 'In Review' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: 'user', type: 'text', content: input }
    ]);
    setInput('');

    // Respond with thinking and table for ANY user message
    setThinking(true);
    setMessages((prev) => [
      ...prev,
      { sender: 'bot', type: 'thinking', content: 'Thinking...' }
    ]);
    setTableStep(1);
    // Remove thinking state after the effect
    setTimeout(() => setThinking(false), 1000);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-end pointer-events-none">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={onClose}></div>
      <div className="relative z-50 m-12 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden pointer-events-auto animate-fadeInUp" style={{ minHeight: 540, maxHeight: 800 }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <span className="font-semibold text-lg text-navy-900 flex items-center gap-2">
            <MessageCircle size={20} className="text-teal-600" />
            SwiftBid Chatbot
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-teal-600 transition-colors text-xl font-bold">&times;</button>
        </div>
        <div className="flex-1 px-5 py-4 overflow-y-auto text-slate-700" style={{ background: '#f8fafc' }}>
          <div className="flex flex-col gap-3">
            {messages.map((msg, idx) => {
              if (msg.type === 'text') {
                return (
                  <div key={idx} className={`px-4 py-2 rounded-xl max-w-[80%] ${msg.sender === 'bot' ? 'self-start bg-slate-200 text-slate-800' : 'self-end bg-teal-100 text-teal-900'}`}>{msg.content}</div>
                );
              }
              if (msg.type === 'thinking') {
                return (
                  <div key={idx} className="self-start flex items-center gap-2 text-slate-500 animate-pulse px-4 py-2 rounded-xl bg-slate-100 max-w-[80%]">
                    <span>{msg.content}</span>
                    <span className="animate-bounce">...</span>
                  </div>
                );
              }
              if (msg.type === 'table') {
                return (
                  <div key={idx} className="self-start bg-white border border-slate-200 rounded-xl p-2 overflow-x-auto shadow-sm max-w-full">
                    <table className="min-w-[320px] text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-3 py-2 font-semibold text-slate-700">Client</th>
                          <th className="px-3 py-2 font-semibold text-slate-700">RFP Title</th>
                          <th className="px-3 py-2 font-semibold text-slate-700">Value</th>
                          <th className="px-3 py-2 font-semibold text-slate-700">Deadline</th>
                          <th className="px-3 py-2 font-semibold text-slate-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableRows.slice(0, tableRowsToShow).map((row, i) => (
                          <tr key={i} className="even:bg-slate-50">
                            <td className="px-3 py-2 whitespace-nowrap">{row.client}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{row.title}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{row.value}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{row.deadline}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{row.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
        <form className="flex items-center gap-2 px-5 py-3 border-t border-slate-100 bg-white" onSubmit={handleSubmit}>
          <input
            type="text"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-200 focus:outline-none bg-slate-50"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={thinking}
          />
          <button type="submit" className={`bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold text-sm ${thinking ? 'cursor-not-allowed opacity-60' : ''}`} disabled={thinking}>
            Send
          </button>
        </form>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.3s cubic-bezier(.4,0,.2,1); }
      `}</style>
    </div>
  );
};

const FloatingChatbotButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="fixed z-50 bottom-8 right-8 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-transform duration-200 active:scale-95 border-4 border-white"
    style={{ boxShadow: '0 8px 32px rgba(16, 185, 129, 0.18)' }}
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