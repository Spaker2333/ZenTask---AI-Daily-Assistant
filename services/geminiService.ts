import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

export const generateDailySummary = async (completedTasks: string[], lang: Language): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not found. Please check your environment configuration.";
  }

  if (completedTasks.length === 0) {
    return lang === 'zh' ? "看来你今天还没完成任何任务。开始行动吧，总结会在这里显示！" : "It looks like you haven't completed any tasks yet. Get started to see your summary here!";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let prompt = `
      I have completed the following tasks today:
      ${completedTasks.map(t => `- ${t}`).join('\n')}

      Please provide a brief, encouraging daily summary (under 80 words). 
      Highlight the productivity and suggest a mood for the evening. 
      Talk to me directly as "you".
      Use emojis sparingly but effectively.
    `;

    if (lang === 'zh') {
      prompt += `
      IMPORTANT: Please reply strictly in CHINESE (Simplified).
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return lang === 'zh' ? "抱歉，暂时无法连接到AI服务，请稍后再试。" : "Sorry, I couldn't connect to the AI service at the moment. Please try again later.";
  }
};
