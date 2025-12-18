import React, { useState, useEffect } from 'react';
import { Layers, Library, Bookmark, Zap, Share2 } from 'lucide-react';
import { getInitialState, saveTerms, saveSentences, saveProgress, saveDailySet, generateDailySet } from './services/storageService';
import { getDailyRecommendation, generateDailySetContent } from './services/geminiService';
import { AppState, Term, DailySet } from './types';
import DailyView from './components/DailyView';
import LibraryView from './components/LibraryView';
import SavedView from './components/SavedView';

const App: React.FC = () => {
  const [state, setState] = useState<AppState | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Load initial data from storage or constants
    const initialState = getInitialState();
    setState(initialState);
  }, []);

  // Fetch daily resource if missing OR if topic changed and resource doesn't match (simplified by just checking missing)
  useEffect(() => {
    if (state && state.dailySet && !state.dailySet.resource && !isRefreshing) {
       // Only fetch if we are in daily view or just loaded to avoid unnecessary API calls
       getDailyRecommendation(state.dailySet.topic).then(resource => {
          if (resource && state.dailySet) {
             const updatedDaily = { ...state.dailySet, resource };
             setState(prev => prev ? ({ ...prev, dailySet: updatedDaily }) : null);
             saveDailySet(updatedDaily);
          }
       });
    }
  }, [state?.dailySet?.date, state?.dailySet?.topic]);

  if (!state) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading BizLingo...</div>;

  const handleNavChange = (view: AppState['currentView']) => {
    setState(prev => prev ? { ...prev, currentView: view } : null);
  };

  const toggleSaveTerm = (id: string) => {
    if (!state) return;
    const updatedTerms = state.terms.map(t => 
      t.id === id ? { ...t, saved: !t.saved } : t
    );
    setState({ ...state, terms: updatedTerms });
    saveTerms(updatedTerms);
  };

  const toggleSaveSentence = (id: string) => {
    if (!state) return;
    const updatedSentences = state.sentences.map(s => 
      s.id === id ? { ...s, saved: !s.saved } : s
    );
    setState({ ...state, sentences: updatedSentences });
    saveSentences(updatedSentences);
  };

  const handleUnsave = (id: string, type: 'term' | 'sentence') => {
    if (type === 'term') toggleSaveTerm(id);
    else toggleSaveSentence(id);
  };

  const handleRefreshDaily = async (topic: string) => {
    if (!state) return;
    setIsRefreshing(true);
    
    // 1. Try to generate new content via AI
    const aiContent = await generateDailySetContent(topic);
    
    // 2. Mix with existing content or use purely AI content
    // Convert AI content to Term/Sentence objects with IDs
    const newTerms: Term[] = aiContent.terms.map(t => ({
      ...t,
      id: 'gen_term_' + Math.random().toString(36).substr(2, 9),
      saved: false
    }));
    
    const newSentences: any[] = aiContent.sentences.map(s => ({
      ...s,
      id: 'gen_sent_' + Math.random().toString(36).substr(2, 9),
      saved: false
    }));

    // Update global library with these new generated items immediately so they can be saved
    // Note: We append them to the library so they are searchable later
    const updatedTermsLib = [...state.terms, ...newTerms];
    const updatedSentencesLib = [...state.sentences, ...newSentences];

    // 3. Create the new Daily Set
    const today = new Date().toISOString().split('T')[0];
    
    // If AI failed (empty arrays), fallback to local storage logic
    let dailySet: DailySet;
    if (newTerms.length === 0 && newSentences.length === 0) {
       dailySet = generateDailySet(today, topic, state.terms, state.sentences);
    } else {
       dailySet = {
         date: today,
         topic: topic,
         items: [...newTerms, ...newSentences], // Use the fresh AI content
         completed: false,
         resource: undefined // Will trigger useEffect to fetch
       };
    }

    setState({ 
      ...state, 
      terms: updatedTermsLib, 
      sentences: updatedSentencesLib,
      dailySet: dailySet 
    });
    
    saveTerms(updatedTermsLib);
    saveSentences(updatedSentencesLib);
    saveDailySet(dailySet);
    
    setIsRefreshing(false);
  };

  const handleSaveAllDaily = () => {
     if (!state || !state.dailySet) return;
     
     // 1. Identify IDs in daily set
     const dailyTermIds = new Set(state.dailySet.items.filter(i => (i as any).term_en).map(i => i.id));
     const dailySentenceIds = new Set(state.dailySet.items.filter(i => (i as any).content).map(i => i.id));

     // 2. Update all terms and sentences
     const updatedTerms = state.terms.map(t => dailyTermIds.has(t.id) ? { ...t, saved: true } : t);
     const updatedSentences = state.sentences.map(s => dailySentenceIds.has(s.id) ? { ...s, saved: true } : s);

     setState({ ...state, terms: updatedTerms, sentences: updatedSentences });
     saveTerms(updatedTerms);
     saveSentences(updatedSentences);
     alert("Saved all items to Library!");
  };

  const handleAddGeneratedTerm = (term: Term) => {
    if (!state) return;
    const updatedTerms = [...state.terms, term];
    setState({ ...state, terms: updatedTerms });
    saveTerms(updatedTerms);
  };

  const completeDaily = () => {
    if (!state || !state.dailySet) return;
    
    // Check if already completed today
    if (state.dailySet.completed) return;

    const today = new Date().toISOString().split('T')[0];
    const newStreak = state.progress.completedDates.includes(today) 
      ? state.progress.streak 
      : state.progress.streak + 1;
    
    const newCompletedDates = state.progress.completedDates.includes(today)
      ? state.progress.completedDates
      : [...state.progress.completedDates, today];

    const updatedProgress = {
      ...state.progress,
      streak: newStreak,
      lastCheckIn: today,
      completedDates: newCompletedDates
    };

    const updatedDailySet = { ...state.dailySet, completed: true };

    setState({
      ...state,
      progress: updatedProgress,
      dailySet: updatedDailySet
    });

    saveProgress(updatedProgress);
    saveDailySet(updatedDailySet);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'BizLingo',
      text: 'Master Business English with daily cards! Check out BizLingo.',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#f8fafc] text-slate-800">
      
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
          <span className="font-bold text-xl tracking-tight">BizLingo</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => handleNavChange('daily')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${state.currentView === 'daily' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Layers size={20} /> Today
          </button>
          <button 
            onClick={() => handleNavChange('library')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${state.currentView === 'library' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Library size={20} /> Library
          </button>
          <button 
            onClick={() => handleNavChange('saved')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${state.currentView === 'saved' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Bookmark size={20} /> Saved
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-indigo-600 font-medium">
             <Zap size={18} fill="currentColor" />
             <span>{state.progress.streak} Day Streak</span>
          </div>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors text-sm font-medium"
          >
             <Share2 size={16} /> Share App
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Top Header */}
        <div className="md:hidden flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-100/50">
          <span className="font-bold text-lg tracking-tight">BizLingo</span>
          <div className="flex items-center gap-2">
            <button 
               onClick={handleShare}
               className="p-2 text-slate-400 hover:text-indigo-600 rounded-full"
            >
               <Share2 size={20} />
            </button>
            <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              <Zap size={14} fill="currentColor" />
              {state.progress.streak}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar relative">
          {state.currentView === 'daily' && state.dailySet && (
            <div className="h-full flex flex-col justify-center">
               <DailyView 
                 dailySet={state.dailySet} 
                 onToggleSaveTerm={toggleSaveTerm}
                 onToggleSaveSentence={toggleSaveSentence}
                 onCompleteDaily={completeDaily}
                 onRefreshDaily={handleRefreshDaily}
                 onSaveAllDaily={handleSaveAllDaily}
                 isRefreshing={isRefreshing}
               />
            </div>
          )}
          {state.currentView === 'library' && (
            <LibraryView 
              terms={state.terms} 
              sentences={state.sentences} 
              onAddTerm={handleAddGeneratedTerm}
            />
          )}
          {state.currentView === 'saved' && (
             <SavedView 
               terms={state.terms} 
               sentences={state.sentences} 
               onUnsave={handleUnsave}
             />
          )}
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden bg-white border-t border-slate-200 pb-safe pt-2 px-6 flex justify-between items-center z-30">
           <button 
             onClick={() => handleNavChange('daily')}
             className={`flex flex-col items-center gap-1 p-3 transition-colors ${state.currentView === 'daily' ? 'text-indigo-600' : 'text-slate-400'}`}
           >
             <Layers size={24} strokeWidth={state.currentView === 'daily' ? 2.5 : 2} />
             <span className="text-[10px] font-medium">Today</span>
           </button>
           <button 
             onClick={() => handleNavChange('library')}
             className={`flex flex-col items-center gap-1 p-3 transition-colors ${state.currentView === 'library' ? 'text-indigo-600' : 'text-slate-400'}`}
           >
             <Library size={24} strokeWidth={state.currentView === 'library' ? 2.5 : 2} />
             <span className="text-[10px] font-medium">Library</span>
           </button>
           <button 
             onClick={() => handleNavChange('saved')}
             className={`flex flex-col items-center gap-1 p-3 transition-colors ${state.currentView === 'saved' ? 'text-indigo-600' : 'text-slate-400'}`}
           >
             <Bookmark size={24} strokeWidth={state.currentView === 'saved' ? 2.5 : 2} />
             <span className="text-[10px] font-medium">Saved</span>
           </button>
        </div>
      </main>
    </div>
  );
};

export default App;