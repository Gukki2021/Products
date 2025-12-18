export type CardType = 'term' | 'sentence';

export interface Term {
  id: string;
  term_en: string;
  term_zh: string;
  explanation: string;
  examples: string[];
  image_url?: string;
  category: string;
  saved: boolean;
  user_notes?: string;
}

export interface Sentence {
  id: string;
  content: string;
  category: string; // e.g., 'Project Updates', 'Meetings'
  saved: boolean;
}

export interface DailyResource {
  title: string;
  url: string;
  type: 'podcast' | 'video' | 'blog';
  summary: string;
}

export interface DailySet {
  date: string; // ISO date string YYYY-MM-DD
  topic: string; // New: The theme of the day
  items: (Term | Sentence)[];
  completed: boolean;
  resource?: DailyResource;
}

export interface UserProgress {
  streak: number;
  lastCheckIn: string | null; // ISO date string
  completedDates: string[]; // List of YYYY-MM-DD
  savedItemIds: string[];
}

export interface AppState {
  currentView: 'daily' | 'library' | 'saved';
  terms: Term[];
  sentences: Sentence[];
  dailySet: DailySet | null;
  progress: UserProgress;
}
