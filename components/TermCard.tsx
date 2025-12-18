import React, { useState } from 'react';
import { Term } from '../types';
import { Bookmark, Copy, Check, Info, Globe, ExternalLink } from 'lucide-react';
import { explainTerm, searchTermOnWeb, WebSearchResult } from '../services/geminiService';

interface TermCardProps {
  term: Term;
  onToggleSave: (id: string) => void;
}

const TermCard: React.FC<TermCardProps> = ({ term, onToggleSave }) => {
  const [copied, setCopied] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [webResult, setWebResult] = useState<WebSearchResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingWeb, setLoadingWeb] = useState(false);
  const [activeTab, setActiveTab] = useState<'def' | 'ai' | 'web'>('def');

  const handleCopy = () => {
    navigator.clipboard.writeText(`${term.term_en} - ${term.term_zh}\n${term.explanation}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAiExplain = async () => {
    setActiveTab('ai');
    if (aiExplanation) return;
    setLoadingAi(true);
    const text = await explainTerm(term.term_en);
    setAiExplanation(text);
    setLoadingAi(false);
  };

  const handleWebSearch = async () => {
    setActiveTab('web');
    if (webResult) return;
    setLoadingWeb(true);
    const result = await searchTermOnWeb(term.term_en);
    setWebResult(result);
    setLoadingWeb(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 flex gap-2">
        <button 
          onClick={handleWebSearch}
          className={`p-2 rounded-full transition-colors ${activeTab === 'web' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}
          title="Search Web Context"
        >
          <Globe size={20} />
        </button>
        <button 
          onClick={handleAiExplain}
          className={`p-2 rounded-full transition-colors ${activeTab === 'ai' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
          title="Get AI Explanation"
        >
          <Info size={20} />
        </button>
        <button 
          onClick={() => onToggleSave(term.id)}
          className={`p-2 rounded-full transition-colors ${term.saved ? 'text-yellow-500 fill-current' : 'text-slate-300 hover:text-slate-400'}`}
        >
          <Bookmark size={22} />
        </button>
      </div>

      <div className="mt-2 mb-1">
        <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-md mb-3">
          {term.category}
        </span>
      </div>

      <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{term.term_en}</h2>
      <h3 className="text-xl text-slate-500 font-medium mb-6">{term.term_zh}</h3>

      <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar">
        {activeTab === 'def' && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Definition</h4>
              <p className="text-slate-700 leading-relaxed text-lg">{term.explanation}</p>
            </div>
            <div>
               <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Usage</h4>
               <ul className="space-y-3">
                 {term.examples.map((ex, idx) => (
                   <li key={idx} className="flex gap-3 text-slate-600 italic border-l-2 border-slate-200 pl-3">
                     <span>"{ex}"</span>
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="animate-fade-in bg-indigo-50 p-4 rounded-lg border border-indigo-100">
             <h4 className="text-xs uppercase tracking-wider text-indigo-500 font-semibold mb-2">AI Insight</h4>
             {loadingAi ? (
               <div className="text-indigo-400 animate-pulse text-sm">Consulting AI...</div>
             ) : (
               <p className="text-indigo-800 text-sm leading-relaxed">{aiExplanation}</p>
             )}
          </div>
        )}

        {activeTab === 'web' && (
          <div className="animate-fade-in bg-blue-50 p-4 rounded-lg border border-blue-100">
             <h4 className="text-xs uppercase tracking-wider text-blue-600 font-semibold mb-2">Web Context</h4>
             {loadingWeb ? (
               <div className="text-blue-400 animate-pulse text-sm">Searching the web...</div>
             ) : (
               <div className="space-y-3">
                  <p className="text-blue-900 text-sm leading-relaxed whitespace-pre-wrap">{webResult?.text}</p>
                  {webResult?.links && webResult.links.length > 0 && (
                    <div className="pt-2 border-t border-blue-100 mt-2">
                      <p className="text-xs font-semibold text-blue-500 mb-1">Sources:</p>
                      <ul className="space-y-1">
                        {webResult.links.map((link, i) => (
                          <li key={i}>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-700 hover:underline truncate">
                              <ExternalLink size={10} /> {link.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
               </div>
             )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
         {activeTab !== 'def' && (
           <button onClick={() => setActiveTab('def')} className="text-xs font-medium text-slate-400 hover:text-slate-600">
             Back to Card
           </button>
         )}
        <button 
          onClick={handleCopy}
          className="ml-auto flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors active:scale-95 transform"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

export default TermCard;
