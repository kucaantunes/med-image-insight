import OpenAI from "openai";
import { HfInference } from "@huggingface/inference";

// Initialize Hugging Face with a function to get the API key
const getHuggingFaceClient = () => {
  const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("Hugging Face API key is not set. Please provide your API key in the project settings.");
  }
  return new HfInference(apiKey);
};

// Initialize OpenAI with a function to get the API key
const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key is not set. Please provide your API key in the project settings.");
  }
  return new OpenAI({ apiKey });
};

interface Reference {
  id: number;
  title: string;
  authors: string;
  year: string;
  venue: string;
  url?: string;
}

interface LLMResponse {
  model: string;
  answer: string;
  references: Reference[];
}

// Function to truncate text while preserving complete sentences
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  
  // Find the last period before maxLength
  const lastPeriod = text.lastIndexOf('.', maxLength);
  return lastPeriod > 0 ? text.slice(0, lastPeriod + 1) : text.slice(0, maxLength);
};

export async function processResearchQuestion(
  question: string,
  pdfText: string
): Promise<LLMResponse[]> {
  const responses: LLMResponse[] = [];
  const hf = getHuggingFaceClient();

  // Truncate text for BART (smaller context window)
  const bartText = truncateText(pdfText, 1000);
  
  // Process with BART
  try {
    const bartResponse = await hf.summarization({
      model: "facebook/bart-large-cnn",
      inputs: `Question: ${question}\n\nContext: ${bartText}`,
      parameters: {
        max_length: 300,
        min_length: 100,
        length_penalty: 2.0,
      },
    });
    
    responses.push({
      model: "BART",
      answer: bartResponse.summary_text,
      references: extractReferences(pdfText)
    });
  } catch (error) {
    console.error("BART Error:", error);
    // Continue with other models even if BART fails
  }

  // Truncate text for GPT-Neo (medium context window)
  const neoText = truncateText(pdfText, 2000);

  // Process with GPT-Neo
  try {
    const neoResponse = await hf.textGeneration({
      model: "EleutherAI/gpt-neo-2.7B",
      inputs: `Based on the following research paper, answer this question: ${question}\n\nPaper content: ${neoText}\n\nDetailed answer:`,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
      },
    });
    
    responses.push({
      model: "GPT-Neo",
      answer: neoResponse.generated_text,
      references: extractReferences(pdfText)
    });
  } catch (error) {
    console.error("GPT-Neo Error:", error);
    // Continue with other models even if GPT-Neo fails
  }

  // Process with GPT-4 (largest context window)
  try {
    const openai = getOpenAIClient();
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a research assistant. Provide detailed answers with citations from the provided text."
        },
        {
          role: "user",
          content: `Question: ${question}\n\nPaper content: ${truncateText(pdfText, 6000)}\n\nProvide a detailed answer with in-text citations [1], [2], etc.`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    responses.push({
      model: "GPT-4",
      answer: gptResponse.choices[0].message?.content || "",
      references: extractReferences(pdfText)
    });
  } catch (error) {
    console.error("GPT-4 Error:", error);
  }

  return responses;
}

function extractReferences(text: string): Reference[] {
  // Basic reference extraction (you might want to enhance this)
  const refSection = text.split("References").pop() || "";
  const refs = refSection.split("\n").filter(line => line.trim().length > 0);
  
  return refs.map((ref, index) => ({
    id: index + 1,
    title: ref.match(/["'](.+?)["']/)?.[ 1] || "Unknown Title",
    authors: ref.split(".")[0] || "Unknown Authors",
    year: ref.match(/\((\d{4})\)/)?.[ 1] || "Unknown Year",
    venue: ref.split(".")[ -1]?.trim() || "Unknown Venue"
  }));
}