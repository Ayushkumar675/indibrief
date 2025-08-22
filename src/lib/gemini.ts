import { GoogleGenerativeAI } from "@google/generative-ai";

// Get the API key from the environment variables.
// Make sure to set this in your .env.local file.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function summarizeArticle(articleContent: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    console.log("GEMINI_API_KEY not found, returning empty summary.");
    return "";
  }

  if (!articleContent) {
    return "";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Summarize the following news article in 5 lines:\n\n${articleContent}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error summarizing article with Gemini:", error);
    // Return an empty string if there's an error, so the process doesn't fail.
    return "";
  }
}
