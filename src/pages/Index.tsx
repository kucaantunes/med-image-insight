import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { processResearchQuestion } from "@/lib/research";

const Index = () => {
  const [question, setQuestion] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      
      // Read file as text
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        setPdfText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || !pdfText.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a research question and PDF content",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const results = await processResearchQuestion(question, pdfText);
      // Navigate to results page with the data
      window.location.href = `/results?data=${encodeURIComponent(JSON.stringify(results))}`;
    } catch (error) {
      toast({
        title: "Error processing request",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="bg-[#1a1f3c] p-6 border-[#2a2d3e]">
          <h1 className="text-3xl font-bold mb-6">Research Question Analysis</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Research Question
              </label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your research question"
                className="bg-[#2a2d3e] border-[#3a3f50]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                PDF Content
              </label>
              <div className="space-y-4">
                <Textarea
                  value={pdfText}
                  onChange={(e) => setPdfText(e.target.value)}
                  placeholder="Paste PDF content here"
                  className="h-48 bg-[#2a2d3e] border-[#3a3f50]"
                />
                <div className="- or -">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="bg-[#2a2d3e] border-[#3a3f50]"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[#4a9eff] hover:bg-[#3a7fd9]"
            >
              {isProcessing ? "Processing..." : "Analyze"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Index;