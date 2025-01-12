import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  rocCurve: {
    fpr: number[];
    tpr: number[];
  };
}

interface Props {
  metrics: ModelMetrics;
}

const ModelEvaluation = ({ metrics }: Props) => {
  return (
    <div className="space-y-6">
      <Card className="bg-[#2a2d3e] p-6">
        <h2 className="text-xl font-semibold mb-4">Model Performance Metrics</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Accuracy</TableCell>
              <TableCell>{(metrics.accuracy * 100).toFixed(2)}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Precision</TableCell>
              <TableCell>{(metrics.precision * 100).toFixed(2)}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Recall</TableCell>
              <TableCell>{(metrics.recall * 100).toFixed(2)}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>F1 Score</TableCell>
              <TableCell>{(metrics.f1Score * 100).toFixed(2)}%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-[#2a2d3e] p-6">
          <h2 className="text-xl font-semibold mb-4">Confusion Matrix</h2>
          {/* Add confusion matrix visualization here */}
        </Card>

        <Card className="bg-[#2a2d3e] p-6">
          <h2 className="text-xl font-semibold mb-4">ROC Curve</h2>
          {/* Add ROC curve visualization here */}
        </Card>
      </div>
    </div>
  );
};

export default ModelEvaluation;