import React from 'react';
import { Term, Sentence } from '../types';
import { Bookmark, Download } from 'lucide-react';

interface SavedViewProps {
  terms: Term[];
  sentences: Sentence[];
  onUnsave: (id: string, type: 'term' | 'sentence') => void;
}

const SavedView: React.FC<SavedViewProps> = ({ terms, sentences, onUnsave }) => {
  const savedTerms = terms.filter(t => t.saved);
  const savedSentences = sentences.filter(s => s.saved);
  const isEmpty = savedTerms.length === 0 && savedSentences.length === 0;

  // Group terms by category
  const groupedTerms = savedTerms.reduce((acc, term) => {
    acc[term.category] = acc[term.category] || [];
    acc[term.category].push(term);
    return acc;
  }, {} as Record<string, Term[]>);

  const handleExportCSV = () => {
    if (isEmpty) return;

    let csvContent = "data:text/csv;charset=utf-8,Type,Category,Content,Translation/Meaning,Notes\n";

    savedTerms.forEach(t => {
      const row = [
        "Term",
        `"${t.category}"`,
        `"${t.term_en}"`,
        `"${t.term_zh} - ${t.explanation.replace(/"/g, '""')}"`,
        ""
      ].join(",");
      csvContent += row + "\n";
    });

    savedSentences.forEach(s => {
      const row = [
        "Sentence",
        `"${s.category}"`,
        `"${s.content.replace(/"/g, '""')}"`,
        "",
        ""
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bizlingo_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full px-4 pt-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Saved Items</h1>
        {!isEmpty && (
           <button 
             onClick={handleExportCSV}
             className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-indigo-100 transition-colors"
           >
             <Download size={16} /> Export Excel
           </button>
        )}
      </div>

      {isEmpty && (
        <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
           <Bookmark size={48} strokeWidth={1.5} className="mb-4 opacity-50"/>
           <p>No saved items yet.</p>
           <p className="text-sm">Tap the bookmark icon on cards to save them here.</p>
        </div>
      )}

      <div className="space-y-8 overflow-y-auto pb-20 no-scrollbar">
        {Object.keys(groupedTerms).length > 0 && (
           <div className="space-y-6">
             {Object.entries(groupedTerms).map(([category, items]) => (
               <div key={category}>
                 <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-1">{category}</h2>
                 <div className="space-y-3">
                   {(items as Term[]).map(term => (
                      <div key={term.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between group">
                        <div>
                          <h3 className="font-bold text-slate-800">{term.term_en}</h3>
                          <p className="text-sm text-slate-500">{term.term_zh}</p>
                        </div>
                        <button 
                          onClick={() => onUnsave(term.id, 'term')}
                          className="text-yellow-500 hover:text-slate-300"
                        >
                          <Bookmark size={20} fill="currentColor" />
                        </button>
                      </div>
                   ))}
                 </div>
               </div>
             ))}
           </div>
        )}

        {savedSentences.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-1">Sentences</h2>
            <div className="space-y-3">
              {savedSentences.map(sentence => (
                 <div key={sentence.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between gap-4">
                   <p className="text-slate-800 font-medium text-sm">"{sentence.content}"</p>
                   <button 
                    onClick={() => onUnsave(sentence.id, 'sentence')}
                    className="text-yellow-500 hover:text-slate-300 shrink-0"
                  >
                    <Bookmark size={20} fill="currentColor" />
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

export default SavedView;