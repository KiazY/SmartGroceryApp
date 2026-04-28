import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with the API key from environment variables
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  console.warn("EXPO_PUBLIC_GEMINI_API_KEY is not defined. Please set it in your .env file.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface ParsedItem {
  name: string;
  quantity: string;
}

export const parseGroceryList = async (text: string): Promise<ParsedItem[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
      You are an AI assistant helping a user extract a grocery list from natural language text.
      The user will provide a sentence or paragraph.
      Extract the items they need to buy and their quantities.
      If no quantity is specified, use "1" or an appropriate default.
      Return the output strictly as a JSON array of objects, where each object has a 'name' (string) and 'quantity' (string) property.
      Do not wrap the JSON in markdown code blocks or add any other text.
      
      User input: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error parsing grocery list with Gemini:", error);
    throw error;
  }
};
