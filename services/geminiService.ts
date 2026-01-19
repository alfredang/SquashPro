import { GoogleGenAI } from "@google/genai";

export const getSquashCoachAdvice = async (
  playerSkill: string,
  opponentSkill: string | undefined,
  context: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      You are a world-class Squash Coach. 
      My skill level is ${playerSkill}.
      ${opponentSkill ? `My opponent's skill level is ${opponentSkill}.` : ''}
      
      The user is asking: "${context}"
      
      Provide a concise, tactical, and motivating tip (max 3 sentences) to help me win or improve. 
      Focus on court positioning, shot selection, or mental game.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Keep your eye on the ball and dominate the T!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Focus on controlling the T and keeping your opponent moving to the back corners.";
  }
};
