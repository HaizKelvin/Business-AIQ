import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const parseSalesInput = async (input: string) => {
  const prompt = `
    You are a Kenyan business assistant. Convert the following natural language sales or expense input into a structured JSON format.
    The input might be in English, Swahili, or a mix (Sheng).
    
    Currency is KES (Kenyan Shillings).
    
    Input: "${input}"
    
    Expected JSON Structure:
    {
      "transactions": [
        {
          "item": "string",
          "quantity": number,
          "unit_price": number,
          "total": number,
          "type": "sale" | "expense"
        }
      ],
      "grand_total": number,
      "description": "Short summary of the action"
    }

    Rules:
    - If "sold" or "nimeuza", type is "sale".
    - If "bought", "nimenunua", "expense", "spent", type is "expense".
    - If quantity is missing, assume 1.
    - If unit_price is missing but total is there, calculate it if possible.
    - Return ONLY the JSON.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    const text = response.text;
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error parsing sales input:", error);
    return null;
  }
};

export const parseMpesaSms = async (sms: string) => {
  const prompt = `
    Extract business data from this M-Pesa SMS message.
    SMS: "${sms}"
    
    Return JSON:
    {
      "amount": number,
      "type": "income" | "expense",
      "party": "string (name of sender/receiver)",
      "code": "string (M-Pesa transaction code)",
      "isMpesa": boolean (true if it's a valid M-Pesa message)
    }
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    const jsonStr = response.text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error parsing M-Pesa SMS:", error);
    return null;
  }
};

export const getBusinessAdvice = async (context: {
  businessName: string;
  recentTransactions: any[];
  inventory: any[];
  debts: any[];
  userQuery?: string;
}) => {
  const prompt = `
    You are Biashara Smart AI, a friendly Kenyan business assistant for ${context.businessName || "a local biashara"}.
    You speak a mix of English and Swahili (Sheng).
    
    Context:
    - Recent Transactions: ${JSON.stringify(context.recentTransactions)}
    - Inventory Levels: ${JSON.stringify(context.inventory)}
    - Outstanding Debts: ${JSON.stringify(context.debts)}
    
    ${context.userQuery ? `User Question: "${context.userQuery}"` : "Provide a general 2-3 sentence insight or advice based on this data."}
    
    Rules:
    - Keep it short (2-4 sentences).
    - Give actionable advice (e.g., "Uza zaidi ya item X" or "Wewe unaspend sana kwa transport").
    - Be encouraging.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error getting business advice:", error);
    return "Pole, siwezi kupata advice saa hii. Hebu jaribu baadaye.";
  }
};

export const getSalesPredictions = async (history: any[]) => {
  const prompt = `
    Based on this transaction history, predict the sales for the next week and give one warning if needed.
    History: ${JSON.stringify(history)}
    
    Return JSON:
    {
      "predicted_sales": number,
      "trend": "up" | "down" | "stable",
      "warning": "string or null"
    }
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    const jsonStr = response.text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error getting predictions:", error);
    return null;
  }
};
