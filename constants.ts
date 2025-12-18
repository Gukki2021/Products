import { Term, Sentence } from './types';

export const SAMPLE_TERMS: Term[] = [
  {
    id: 't1',
    term_en: 'Deliverable',
    term_zh: '交付成果',
    explanation: 'A tangible or intangible good or service produced as a result of a project.',
    examples: [
      'Please ensure all key deliverables are met by Q3.',
      ' The final report is a critical deliverable for this phase.'
    ],
    category: 'Project Management',
    saved: false,
  },
  {
    id: 't2',
    term_en: 'Stakeholder Alignment',
    term_zh: '利益相关者对齐',
    explanation: 'The process of ensuring all parties involved agree on goals and direction.',
    examples: [
      'We need stakeholder alignment before proceeding with the budget increase.',
      'Lack of alignment caused significant delays.'
    ],
    category: 'Consulting',
    saved: false,
  },
  {
    id: 't3',
    term_en: 'Scalability',
    term_zh: '可扩展性',
    explanation: 'The capability of a system to handle a growing amount of work.',
    examples: [
      'The current architecture lacks scalability for our 5-year growth plan.',
      'We chose this cloud provider for its instant scalability.'
    ],
    category: 'Tech',
    saved: false,
  },
  {
    id: 't4',
    term_en: 'Pain Point',
    term_zh: '痛点',
    explanation: 'A specific problem that prospective customers of your business are experiencing.',
    examples: [
      'Our solution directly addresses the customer’s main pain point: efficiency.',
      'Identify the client’s pain points during the discovery call.'
    ],
    category: 'Sales/Consulting',
    saved: false,
  },
  {
    id: 't5',
    term_en: 'Bandwidth',
    term_zh: '精力 / 资源',
    explanation: 'The energy or mental capacity required to deal with a situation.',
    examples: [
      'I don’t have the bandwidth to take on another project right now.',
      'Do we have the team bandwidth to support this launch?'
    ],
    category: 'General Business',
    saved: false,
  },
  {
    id: 't6',
    term_en: 'Low-hanging Fruit',
    term_zh: '唾手可得的成果',
    explanation: 'Targets or goals which are easily achievable and which do not require a lot of effort.',
    examples: [
      'Let’s target the low-hanging fruit first to build momentum.',
      'Optimizing the signup form is low-hanging fruit for increasing conversions.'
    ],
    category: 'Strategy',
    saved: false,
  },
  {
    id: 't7',
    term_en: 'KPI (Key Performance Indicator)',
    term_zh: '关键绩效指标',
    explanation: 'A measurable value that demonstrates how effectively a company is achieving key business objectives.',
    examples: [
      'We need to define clear KPIs for the marketing campaign.',
      'Revenue growth is our primary KPI this quarter.'
    ],
    category: 'Management',
    saved: false,
  },
  {
    id: 't8',
    term_en: 'Bottleneck',
    term_zh: '瓶颈',
    explanation: 'A point of congestion in a production system that slows down the process.',
    examples: [
      'The approval process is the main bottleneck right now.',
      'We need to identify and remove bottlenecks in the supply chain.'
    ],
    category: 'Operations',
    saved: false,
  }
];

export const SAMPLE_SENTENCES: Sentence[] = [
  {
    id: 's1',
    content: 'Could you please clarify the timeline for the next phase?',
    category: 'Clarification',
    saved: false,
  },
  {
    id: 's2',
    content: 'I’d like to circle back to the point raised about budget constraints.',
    category: 'Meetings',
    saved: false,
  },
  {
    id: 's3',
    content: 'Let’s take this offline to avoid holding up the meeting.',
    category: 'Meetings',
    saved: false,
  },
  {
    id: 's4',
    content: 'Moving forward, we should align our weekly updates with the client’s schedule.',
    category: 'Project Updates',
    saved: false,
  },
  {
    id: 's5',
    content: 'I want to ensure we are all on the same page regarding the deliverables.',
    category: 'Alignment',
    saved: false,
  },
  {
    id: 's6',
    content: 'Please find attached the minutes from today’s discussion for your review.',
    category: 'Email',
    saved: false,
  }
];
