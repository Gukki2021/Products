import React, { useState, useEffect } from 'react';
import { DailySet, Term, Sentence } from '../types';
import TermCard from './TermCard';
import SentenceCard from './SentenceCard';
import { CheckCircle2, RefreshCw, Radio, Headphones, Save, ArrowRight, ArrowLeft, Edit2, Loader2, Youtube, PlayCircle } from 'lucide-react';

interface DailyViewProps {
  dailySet: DailySet;
  onToggleSaveTerm: (id: string) => void;
  onToggleSaveSentence: (id: string) => void;
  onCompleteDaily: () => void;
  onRefreshDaily: (topic: string) => void; // Now takes a topic
  onSaveAllDaily: () => void;
  isRefreshing: boolean; // Loading state
}

const DailyView: React.FC<DailyViewProps> = ({ 
  dailySet, 
  onToggleSaveTerm, 
  onToggleSaveSentence, 
  onCompleteDaily,
  onRefreshDaily,
  onSaveAllDaily,
  isRefreshing
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [topicInput, setTopicInput] = useState(dailySet.topic);

  // Sync internal topic state when dailySet changes
  useEffect(() => {
    setTopicInput(dailySet.topic);
    setCurrentIndex(0); // Reset to start on new set
  }, [dailySet]);

  const totalSlides = dailySet.items.length + (dailySet.resource ? 1 : 0) + 1; // +1 for completion card

  const handleNext = () => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmitTopic = () => {
    if (topicInput.trim() && topicInput !== dailySet.topic) {
      onRefreshDaily(topicInput);
      setIsEditingTopic(false);
    } else {
      setIsEditingTopic(false);
    }
  };

  // Render content based on current index
  const renderContent = () => {
    // 1. Learning Cards (Index 0 to items.length - 1)
    if (currentIndex < dailySet.items.length) {
      const item = dailySet.items[currentIndex];
      const isTerm = (item as any).term_en !== undefined;
      return (
        <div className="w-full h-full max-w-sm mx-auto animate-fade-in">
          {isTerm ? (
            <TermCard term={item as Term} onToggleSave={onToggleSaveTerm} />
          ) : (
            <SentenceCard sentence={item as Sentence} onToggleSave={onToggleSaveSentence} />
          )}
        </div>
      );
    }

    // 2. Resource Card (at index == items.length, if exists)
    if (dailySet.resource && currentIndex === dailySet.items.length) {
      const isVideo = dailySet.resource.type === 'video';
      const icon = isVideo ? <Youtube size={20} /> : <Headphones size={20} />;
      const bgGradient = isVideo ? 'from-red-600 to-rose-700' : 'from-indigo-600 to-violet-700';
      const ctaText = isVideo ? 'Watch Video' : 'Listen Now';

      return (
        <div className="w-full h-full max-w-sm mx-auto animate-fade-in">
             <div className={`bg-gradient-to-br ${bgGradient} text-white rounded-2xl shadow-lg p-8 flex flex-col h-full justify-between relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div>
                   <div className="flex items-center gap-2 text-white/80 mb-6 text-sm font-semibold uppercase tracking-wider border border-white/20 inline-flex px-3 py-1 rounded-full w-fit">
                     {icon}
                     <span>Recommended {isVideo ? 'Video' : 'Podcast'}</span>
                   </div>
                   <h2 className="text-2xl font-bold leading-tight mb-4">{dailySet.resource.title}</h2>
                   <p className="text-white/90 leading-relaxed">{dailySet.resource.summary}</p>
                </div>
                <div className="mt-8">
                  <a 
                    href={dailySet.resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-colors gap-2"
                  >
                    {isVideo ? <PlayCircle size={20} className={isVideo ? "text-red-600" : "text-indigo-600"} /> : <PlayCircle size={20} className="text-indigo-600" />}
                    {ctaText}
                  </a>
                </div>
             </div>
        </div>
      );
    }

    // 3. Completion Card (Last)
    return (
        <div className="w-full h-full max-w-sm mx-auto flex items-center justify-center animate-fade-in">
           <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl w-full h-full flex flex-col items-center justify-center p-6 text-center">
              {dailySet.completed ? (
                 <>
                   <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 animate-bounce-short">
                     <CheckCircle2 size={48} />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-800">All Done!</h3>
                   <p className="text-slate-500 mt-2 mb-8">Great work on "{dailySet.topic}".</p>
                   
                   <button 
                     onClick={onSaveAllDaily}
                     className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-full font-medium hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                   >
                     <Save size={18} />
                     Save All to Library
                   </button>
                 </>
              ) : (
                 <>
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                     <CheckCircle2 size={32} />
                   </div>
                   <h3 className="text-xl font-semibold text-slate-700">Finish Session</h3>
                   <button 
                     onClick={onCompleteDaily}
                     className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-full font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                   >
                     Mark as Complete
                   </button>
                 </>
              )}
           </div>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full relative">
      
      {/* Header with Topic Editor */}
      <div className="px-6 py-4 flex flex-col gap-1">
        <div className="flex justify-between items-start">
           <div>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Today's Theme</p>
             {isEditingTopic ? (
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={topicInput}
                   onChange={(e) => setTopicInput(e.target.value)}
                   className="border border-indigo-300 rounded px-2 py-1 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                   autoFocus
                   onKeyDown={(e) => e.key === 'Enter' && handleSubmitTopic()}
                 />
                 <button onClick={handleSubmitTopic} className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm">
                   Go
                 </button>
               </div>
             ) : (
               <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTopic(true)}>
                 <h1 className="text-2xl font-bold text-slate-900 leading-none">{dailySet.topic}</h1>
                 <Edit2 size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
               </div>
             )}
           </div>
           
           {isRefreshing ? (
             <div className="p-2 text-indigo-600 animate-spin bg-indigo-50 rounded-full">
               <Loader2 size={20} />
             </div>
           ) : (
             <button 
                onClick={() => setIsEditingTopic(!isEditingTopic)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-all"
                title="Change Topic"
             >
               <RefreshCw size={20} />
             </button>
           )}
        </div>
      </div>

      {/* Main Card Area */}
      <div className="flex-grow flex items-center justify-center p-4 relative">
         <div className="w-full h-[500px] max-h-[65vh]">
            {isRefreshing ? (
               <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 animate-pulse">
                  <RefreshCw size={48} className="mb-4 animate-spin opacity-20"/>
                  <p>Curating content for "{topicInput}"...</p>
               </div>
            ) : (
               renderContent()
            )}
         </div>
      </div>

      {/* Navigation Controls */}
      <div className="px-8 pb-8 pt-2">
         <div className="flex items-center justify-between max-w-sm mx-auto">
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0 || isRefreshing}
              className={`p-4 rounded-full transition-all border ${currentIndex === 0 ? 'border-slate-100 text-slate-200 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white shadow-sm'}`}
            >
              <ArrowLeft size={24} />
            </button>
            
            <div className="text-xs font-medium text-slate-300 tracking-widest">
              {currentIndex + 1} / {totalSlides}
            </div>

            <button 
              onClick={handleNext}
              disabled={currentIndex === totalSlides - 1 || isRefreshing}
              className={`p-4 rounded-full transition-all border ${currentIndex === totalSlides - 1 ? 'border-slate-100 text-slate-200 cursor-not-allowed' : 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95'}`}
            >
              <ArrowRight size={24} />
            </button>
         </div>
      </div>
    </div>
  );
};

export default DailyView;
