import React, { useState } from 'react';
import { Term, Sentence } from '../types';
import { Search, BookOpen, MessageSquare, Sparkles, PlusCircle, Loader2 } from 'lucide-react';
import { generateTermsByTopic } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid'; // Fallback if no uuid lib, use simple random

interface LibraryViewProps {
  terms: Term[];
  sentences: Sentence[];
  onAddTerm: (term: Term) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ terms, sentences, onAddTerm }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'terms' | 'sentences' | 'generate'>('terms');
  
  // Generation state
  const [genTopic, setGenTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTerms, setGeneratedTerms] = useState<Partial<Term>[]>([]);

  const filteredTerms = terms.filter(t => 
    t.term_en.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.term_zh.includes(searchTerm) ||
    t.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSentences = sentences.filter(s => 
    s.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerate = async () => {
    if (!genTopic.trim()) return;
    setIsGenerating(true);
    setGeneratedTerms([]);
    const results = await generateTermsByTopic(genTopic);
    setGeneratedTerms(results);
    setIsGenerating(false);
  };

  const handleAddToLibrary = (item: any) => {
    const newTerm: Term = {
      id: 'gen_' + Date.now() + Math.random().toString(36).substr(2, 9),
      term_en: item.term_en,
      term_zh: item.term_zh,
      explanation: item.explanation,
      examples: item.examples,
      category: item.category,
      saved: true, // Auto save to library
    };
    onAddTerm(newTerm);
    // Remove from temporary list
    setGeneratedTerms(prev => prev.filter(t => t.term_en !== item.term_en));
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full px-4 pt-4 pb-20">
      <div className="sticky top-0 bg-[#f8fafc] z-10 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Library</h1>
        
        {activeTab !== 'generate' && (
          <div className="relative mb-4">
            <input 
              type="text" 
              placeholder="Search terms or phrases..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
          </div>
        )}

        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('terms')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'terms' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            <BookOpen size={16} /> Vocabulary
          </button>
          <button 
            onClick={() => setActiveTab('sentences')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'sentences' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            <MessageSquare size={16} /> Sentences
          </button>
          <button 
            onClick={() => setActiveTab('generate')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'generate' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            <Sparkles size={16} /> AI Gen
          </button>
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto no-scrollbar flex-1">
        {activeTab === 'terms' && (
          filteredTerms.length > 0 ? filteredTerms.map(term => (
            <div key={term.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start">
                 <div>
                   <h3 className="font-bold text-slate-800">{term.term_en}</h3>
                   <p className="text-sm text-slate-500">{term.term_zh}</p>
                 </div>
                 <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">{term.category}</span>
               </div>
               <p className="mt-2 text-sm text-slate-600 line-clamp-2">{term.explanation}</p>
            </div>
          )) : (
            <div className="text-center py-10 text-slate-400">No terms found.</div>
          )
        )}

        {activeTab === 'sentences' && (
          filteredSentences.length > 0 ? filteredSentences.map(sentence => (
             <div key={sentence.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
               <p className="text-slate-800 font-medium">"{sentence.content}"</p>
               <div className="mt-2 flex justify-end">
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded">{sentence.category}</span>
               </div>
             </div>
          )) : (
            <div className="text-center py-10 text-slate-400">No sentences found.</div>
          )
        )}

        {activeTab === 'generate' && (
           <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
             <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Topic or Theme</label>
                <div className="flex gap-2">
                   <input 
                      type="text" 
                      value={genTopic}
                      onChange={(e) => setGenTopic(e.target.value)}
                      placeholder="e.g. Supply Chain, FinTech, Negotiation"
                      className="flex-1 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                   />
                   <button 
                      onClick={handleGenerate}
                      disabled={isGenerating || !genTopic}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                   >
                     {isGenerating ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18} />}
                     Generate
                   </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">AI will generate 3 useful business terms for this topic.</p>
             </div>

             <div className="space-y-4">
                {generatedTerms.map((item, idx) => (
                   <div key={idx} className="border border-slate-100 rounded-lg p-4 bg-slate-50 animate-fade-in flex justify-between items-start gap-4">
                      <div>
                         <h3 className="font-bold text-slate-800">{item.term_en} <span className="text-slate-500 font-normal text-sm">| {item.term_zh}</span></h3>
                         <p className="text-sm text-slate-600 mt-1">{item.explanation}</p>
                      </div>
                      <button 
                         onClick={() => handleAddToLibrary(item)}
                         className="text-indigo-600 hover:text-indigo-800"
                         title="Add to Library"
                      >
                         <PlusCircle size={24} />
                      </button>
                   </div>
                ))}
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default LibraryView;
