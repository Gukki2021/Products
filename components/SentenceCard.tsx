import React, { useState } from 'react';
import { Sentence } from '../types';
import { Bookmark, Copy, Check, Sparkles, RefreshCw } from 'lucide-react';
import { getSentenceVariations } from '../services/geminiService';

interface SentenceCardProps {
  sentence: Sentence;
  onToggleSave: (id: string) => void;
}

const SentenceCard: React.FC<SentenceCardProps> = ({ sentence, onToggleSave }) => {
  const [copied, setCopied] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showVariations, setShowVariations] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRewrite = async () => {
    if (variations.length > 0) {
      setShowVariations(!showVariations);
      return;
    }
    
    setLoading(true);
    const results = await getSentenceVariations(sentence.content);
    setVariations(results);
    setLoading(false);
    setShowVariations(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-full relative">
      <div className="absolute top-0 right-0 p-4">
        <button 
          onClick={() => onToggleSave(sentence.id)}
          className={`transition-colors ${sentence.saved ? 'text-yellow-500 fill-current' : 'text-slate-300 hover:text-slate-400'}`}
        >
          <Bookmark size={22} />
        </button>
      </div>

      <div className="mt-2 mb-4">
        <span className="inline-block px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-md">
          {sentence.category}
        </span>
      </div>

      <div className="flex-grow flex flex-col justify-center">
        <blockquote className="text-2xl font-medium text-slate-800 leading-snug mb-6">
          "{sentence.content}"
        </blockquote>

        {loading && (
           <div className="flex items-center gap-2 text-indigo-500 mb-4 animate-pulse">
             <RefreshCw size={16} className="animate-spin"/> Generating variations...
           </div>
        )}

        {showVariations && variations.length > 0 && (
          <div className="space-y-3 mb-6 animate-fade-in bg-slate-50 p-4 rounded-xl">
             <h4 className="text-xs uppercase font-bold text-slate-400">Variations</h4>
             {variations.map((v, i) => (
               <div key={i} className="p-2 bg-white rounded border border-slate-100 text-slate-700 text-sm cursor-pointer hover:border-indigo-200" onClick={() => handleCopy(v)}>
                 {v}
               </div>
             ))}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center gap-2">
        <button 
          onClick={() => handleCopy(sentence.content)}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors py-2"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? 'Copied' : 'Copy'}
        </button>

        <button 
          onClick={handleRewrite}
          className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full shadow-sm transition-all active:scale-95"
        >
          <Sparkles size={16} />
          {variations.length > 0 ? (showVariations ? 'Hide Variations' : 'Show Variations') : 'Rewrite AI'}
        </button>
      </div>
    </div>
  );
};

export default SentenceCard;
