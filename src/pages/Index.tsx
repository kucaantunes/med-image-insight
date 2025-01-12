import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import TrainingProgress from "@/components/TrainingProgress";
import ModelEvaluation from "@/components/ModelEvaluation";
import XAIVisualizations from "@/components/XAIVisualizations";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [modelMetrics, setModelMetrics] = useState(null);
  const { toast } = useToast();

  const startTraining = async () => {
    setIsTraining(true);
    toast({
      title: "Training Started",
      description: "Model training has begun. This may take several minutes.",
    });

    try {
      // Training configuration
      const config = {
        datasetPath: "data", // Path to dataset
        epochs: 50,
        batchSize: 32,
        learningRate: 0.001,
        optimizer: "adam",
      };

      // Start training process
      const metrics = await trainModel(config);
      setModelMetrics(metrics);
      setTrainingComplete(true);
      
      toast({
        title: "Training Complete",
        description: `Model achieved ${metrics.accuracy}% accuracy`,
      });
    } catch (error) {
      toast({
        title: "Training Error",
        description: "An error occurred during training.",
        variant: "destructive",
      });
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Card className="bg-[#1a1f3c] p-6 border-[#2a2d3e]">
          <h1 className="text-3xl font-bold mb-4">Medical Image Classification Training</h1>
          <p className="text-gray-300 mb-6">
            Train a deep learning model on chest X-ray images to classify COVID-19, Normal, and Pneumonia cases.
          </p>
          
          {!isTraining && !trainingComplete && (
            <Button 
              onClick={startTraining}
              className="bg-[#4a9eff] hover:bg-[#3a7fd9]"
            >
              Start Training
            </Button>
          )}

          {isTraining && <TrainingProgress />}

          {trainingComplete && modelMetrics && (
            <div className="space-y-8">
              <ModelEvaluation metrics={modelMetrics} />
              <XAIVisualizations />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;