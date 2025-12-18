import { AppState, UserProgress, Term, Sentence, DailySet } from '../types';
import { SAMPLE_TERMS, SAMPLE_SENTENCES } from '../constants';
import { generateDailySetContent } from './geminiService';

const KEYS = {
  TERMS: 'bizlingo_terms',
  SENTENCES: 'bizlingo_sentences',
  PROGRESS: 'bizlingo_progress',
  DAILY_SET: 'bizlingo_daily_set',
};

const DEFAULT_TOPICS = [
  'Project Management', 
  'Negotiation Strategies', 
  'Financial Markets', 
  'Remote Leadership', 
  'Agile Methodology', 
  'Client Relations',
  'Digital Transformation'
];

export const getInitialState = (): AppState => {
  const storedTerms = localStorage.getItem(KEYS.TERMS);
  const storedSentences = localStorage.getItem(KEYS.SENTENCES);
  const storedProgress = localStorage.getItem(KEYS.PROGRESS);
  const storedDailySet = localStorage.getItem(KEYS.DAILY_SET);

  const terms: Term[] = storedTerms ? JSON.parse(storedTerms) : SAMPLE_TERMS;
  const sentences: Sentence[] = storedSentences ? JSON.parse(storedSentences) : SAMPLE_SENTENCES;
  
  const progress: UserProgress = storedProgress ? JSON.parse(storedProgress) : {
    streak: 0,
    lastCheckIn: null,
    completedDates: [],
    savedItemIds: []
  };

  let dailySet: DailySet | null = storedDailySet ? JSON.parse(storedDailySet) : null;
  
  // Logic to generate a new daily set if one doesn't exist for today
  const today = new Date().toISOString().split('T')[0];
  
  if (!dailySet || dailySet.date !== today) {
    // Pick a random topic for the new day
    const randomTopic = DEFAULT_TOPICS[Math.floor(Math.random() * DEFAULT_TOPICS.length)];
    dailySet = generateDailySet(today, randomTopic, terms, sentences);
    localStorage.setItem(KEYS.DAILY_SET, JSON.stringify(dailySet));
  }

  return {
    currentView: 'daily',
    terms,
    sentences,
    dailySet,
    progress,
  };
};

// Exported to allow manual refresh with topic
export const generateDailySet = (
  date: string, 
  topic: string,
  existingTerms: Term[], 
  existingSentences: Sentence[]
): DailySet => {
  
  // Filter existing content by topic/category first (simple string match)
  const relevantTerms = existingTerms.filter(t => t.category.toLowerCase().includes(topic.toLowerCase()) || t.explanation.includes(topic));
  const relevantSentences = existingSentences.filter(s => s.category.toLowerCase().includes(topic.toLowerCase()) || s.content.includes(topic));

  let selectedTerms = relevantTerms;
  let selectedSentences = relevantSentences;

  // If we don't have enough, fill with random items (Fallback if AI generation isn't called immediately)
  // In App.tsx we will try to upgrade this with AI content if possible.
  if (selectedTerms.length < 3) {
    const others = existingTerms.filter(t => !selectedTerms.includes(t));
    selectedTerms = [...selectedTerms, ...others.sort(() => 0.5 - Math.random()).slice(0, 3 - selectedTerms.length)];
  } else {
    selectedTerms = selectedTerms.slice(0, 3);
  }

  if (selectedSentences.length < 2) {
    const others = existingSentences.filter(s => !selectedSentences.includes(s));
    selectedSentences = [...selectedSentences, ...others.sort(() => 0.5 - Math.random()).slice(0, 2 - selectedSentences.length)];
  } else {
    selectedSentences = selectedSentences.slice(0, 2);
  }
  
  return {
    date,
    topic,
    items: [...selectedTerms, ...selectedSentences].sort(() => 0.5 - Math.random()),
    completed: false,
    resource: undefined // Will be populated async
  };
};

export const saveProgress = (progress: UserProgress) => {
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
};

export const saveTerms = (terms: Term[]) => {
  localStorage.setItem(KEYS.TERMS, JSON.stringify(terms));
};

export const saveSentences = (sentences: Sentence[]) => {
  localStorage.setItem(KEYS.SENTENCES, JSON.stringify(sentences));
};

export const saveDailySet = (dailySet: DailySet) => {
  localStorage.setItem(KEYS.DAILY_SET, JSON.stringify(dailySet));
};
