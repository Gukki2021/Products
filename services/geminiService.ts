import { GoogleGenAI, Type } from "@google/genai";
import { Term, Sentence, DailyResource } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --- Sentence Variations ---

export const getSentenceVariations = async (sentence: string): Promise<string[]> => {
  if (!ai) return ["API Key missing."];

  try {
    const prompt = `
      Act as a business communication expert. 
      Rewrite the following business sentence in 2 different professional ways.
      Keep them concise and formal.
      Original: "${sentence}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API error:", error);
    return [];
  }
};

// --- Term Explanation ---

export const explainTerm = async (term: string): Promise<string> => {
   if (!ai) return "AI explanation unavailable (Missing Key).";
   
   try {
     const response = await ai.models.generateContent({
       model: 'gemini-3-flash-preview',
       contents: `Explain the business term "${term}" simply for a non-expert in one short paragraph.`,
     });
     return response.text || "No explanation generated.";
   } catch (e) {
     return "Error generating explanation.";
   }
}

// --- Web Search Grounding (Deep Dive) ---

export interface WebSearchResult {
  text: string;
  links: { title: string; url: string }[];
}

export const searchTermOnWeb = async (term: string): Promise<WebSearchResult> => {
  if (!ai) return { text: "API Key missing.", links: [] };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Supports tools
      contents: `Find real-world business context, recent news, or a clear definition for the term: "${term}". Provide a summary.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Extract links from grounding chunks
    const links: { title: string; url: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri) {
        links.push({
          title: chunk.web.title || "Source",
          url: chunk.web.uri
        });
      }
    });

    return {
      text: response.text || "No results found.",
      links: links
    };
  } catch (e) {
    console.error(e);
    return { text: "Error searching web.", links: [] };
  }
}

// --- Term Generation by Topic (Library - Large Batch) ---

export const generateTermsByTopic = async (topic: string): Promise<Omit<Term, 'id' | 'saved'>[]> => {
  if (!ai) return [];

  try {
    const prompt = `
      Generate 12 distinct, professional business English terms or idioms related to the topic: "${topic}".
      Include Chinese translation, a simple explanation, and an example sentence.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term_en: { type: Type.STRING },
              term_zh: { type: Type.STRING },
              explanation: { type: Type.STRING },
              example: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ['term_en', 'term_zh', 'explanation', 'example', 'category']
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    
    // Map response to match Term interface
    return data.map((item: any) => ({
      term_en: item.term_en,
      term_zh: item.term_zh,
      explanation: item.explanation,
      examples: [item.example],
      category: item.category || topic,
    }));

  } catch (e) {
    console.error(e);
    return [];
  }
}

// --- Daily Recommendation ---

export const getDailyRecommendation = async (topic: string): Promise<DailyResource | null> => {
  if (!ai) return null;

  try {
    const prompt = `
      Find a highly-rated, professional Podcast episode OR YouTube video specifically about "${topic}" in a business context. 
      Prioritize content from top industry channels (e.g., HBR, TED, WSJ, specialized industry channels).
      Return the title, valid url, type ('podcast' or 'video'), and a very short summary.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['podcast', 'video', 'blog'] },
                summary: { type: Type.STRING }
            }
        }
      }
    });

    return JSON.parse(response.text || "null");
  } catch (e) {
    console.error("Error fetching daily recommendation", e);
    return null;
  }
}

// --- Generate Full Daily Set by Topic ---

export const generateDailySetContent = async (topic: string): Promise<{ terms: Omit<Term, 'id' | 'saved'>[], sentences: Omit<Sentence, 'id' | 'saved'>[] }> => {
  if (!ai) {
    // Fallback Mock Data if API is missing
    return { terms: [], sentences: [] };
  }

  try {
     const prompt = `
       Create a mini-course for the business topic: "${topic}".
       1. Generate 3 key Vocabulary Terms (English, Chinese, Explanation, Example).
       2. Generate 2 useful Business Sentences (Content, Category e.g. Email/Meeting).
       
       Return JSON.
     `;

     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             terms: {
               type: Type.ARRAY,
               items: {
                  type: Type.OBJECT,
                  properties: {
                    term_en: { type: Type.STRING },
                    term_zh: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    example: { type: Type.STRING },
                    category: { type: Type.STRING }
                  }
               }
             },
             sentences: {
               type: Type.ARRAY,
               items: {
                 type: Type.OBJECT,
                 properties: {
                   content: { type: Type.STRING },
                   category: { type: Type.STRING }
                 }
               }
             }
          }
        }
      }
    });
    
    const data = JSON.parse(response.text || "{}");
    return {
      terms: data.terms?.map((t: any) => ({ ...t, examples: [t.example] })) || [],
      sentences: data.sentences || []
    };

  } catch (e) {
    console.error("Error generating daily set", e);
    return { terms: [], sentences: [] };
  }
}
