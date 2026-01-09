
import { GoogleGenAI, Type } from "@google/genai";
import { UserPersona } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateStudyPlan = async (persona: UserPersona, targetExam: string, availableHours: number) => {
  const ai = getAIClient();
  const prompt = `Act as an expert academic counselor for ${persona === UserPersona.JEE_NEET ? 'JEE/NEET' : 'College Engineering/Science'} students. 
  Create a detailed study plan for ${targetExam} assuming the student has ${availableHours} hours per week. 
  Focus on high-yield topics first.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          topics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                priority: { type: Type.STRING },
                estimatedHours: { type: Type.NUMBER }
              },
              required: ["name", "priority", "estimatedHours"]
            }
          }
        },
        required: ["subject", "topics"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const solveDoubt = async (query: string, imageBase64?: string) => {
  const ai = getAIClient();
  const prompt = `Solve this academic doubt with the clarity of a high-end handwritten textbook.
  
  Format Rules:
  1. For equations, use readable symbols: lambda for λ, delta for Δ, sqrt() for square root.
  2. Put every significant algebraic step on a NEW LINE.
  3. Format matrices or determinants clearly using spacing, e.g.:
     | 1  5 -1 |
     | 4  3 -3 |
  4. Use "### Step X: [Description]" for sections.
  5. Put the definitive final answer in "#### Final Result: [Answer]".
  6. Avoid complex LaTeX code like \\begin{pmatrix}; use clean text-based math instead.

  Question: ${query}`;

  const parts: any[] = [{ text: prompt }];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: imageBase64.split(',')[1]
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      temperature: 0.1,
      topP: 0.8,
      topK: 40
    }
  });

  return response.text;
};

export const searchResources = async (topic: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find the best free online resources for learning "${topic}". 
    Format your response strictly using Markdown:
    - Use ### for Section Headings
    - Use bullet points for specific resources
    - Use clear text-based mathematical notation.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  
  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};
