import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

interface LLMResponse {
  model: string;
  answer: string;
  references: Reference[];
}

interface Reference {
  id: number;
  title: string;
  authors: string;
  year: string;
  venue: string;
  url?: string;
}

const Results = () => {
  const [responses, setResponses] = useState<LLMResponse[]>([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get("data");
    if (data) {
      setResponses(JSON.parse(decodeURIComponent(data)));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-6">Analysis Results</h1>

        {responses.map((response, index) => (
          <Card key={index} className="bg-[#1a1f3c] p-6 border-[#2a2d3e]">
            <h2 className="text-2xl font-semibold mb-4">
              {response.model} Analysis
            </h2>
            
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{response.answer}</ReactMarkdown>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">References</h3>
              <div className="space-y-4">
                {response.references.map((ref) => (
                  <div key={ref.id} className="text-sm text-gray-300">
                    [{ref.id}] {ref.authors} ({ref.year}). {ref.title}. {ref.venue}.
                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-[#4a9eff] hover:underline"
                      >
                        [Link]
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Results;