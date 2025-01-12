import OpenAI from "openai";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

export async function processResearchQuestion(
  question: string,
  pdfText: string
): Promise<LLMResponse[]> {
  // Truncate text if needed (most models have 4096 token limit)
  const truncatedText = pdfText.slice(0, 12000); // Approximate limit

  const responses: LLMResponse[] = [];

  // Process with BART
  try {
    const bartResponse = await hf.summarization({
      model: "facebook/bart-large-cnn",
      inputs: `Question: ${question}\n\nContext: ${truncatedText}`,
      parameters: {
        max_length: 512,
        min_length: 200,
      },
    });
    
    responses.push({
      model: "BART",
      answer: bartResponse.summary_text,
      references: extractReferences(pdfText)
    });
  } catch (error) {
    console.error("BART Error:", error);
  }

  // Process with GPT-Neo
  try {
    const neoResponse = await hf.textGeneration({
      model: "EleutherAI/gpt-neo-2.7B",
      inputs: `Based on the following research paper, answer this question: ${question}\n\nPaper content: ${truncatedText}\n\nDetailed answer:`,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.7,
      },
    });
    
    responses.push({
      model: "GPT-Neo",
      answer: neoResponse.generated_text,
      references: extractReferences(pdfText)
    });
  } catch (error) {
    console.error("GPT-Neo Error:", error);
  }

  // Process with GPT-4
  try {
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a research assistant. Provide detailed answers with citations from the provided text."
        },
        {
          role: "user",
          content: `Question: ${question}\n\nPaper content: ${truncatedText}\n\nProvide a detailed answer with in-text citations [1], [2], etc.`
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