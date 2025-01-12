import { useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TrainingProgress = () => {
  const chartRef = useRef(null);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white'
        }
      },
    },
    scales: {
      y: {
        grid: {
          color: '#2a2d3e'
        },
        ticks: {
          color: 'white'
        }
      },
      x: {
        grid: {
          color: '#2a2d3e'
        },
        ticks: {
          color: 'white'
        }
      }
    }
  };

  const data = {
    labels: ['Epoch 1', 'Epoch 2', 'Epoch 3', 'Epoch 4', 'Epoch 5'],
    datasets: [
      {
        label: 'Training Loss',
        data: [0.8, 0.6, 0.4, 0.3, 0.2],
        borderColor: '#4a9eff',
        backgroundColor: 'rgba(74, 158, 255, 0.5)',
      },
      {
        label: 'Validation Loss',
        data: [0.85, 0.65, 0.45, 0.35, 0.25],
        borderColor: '#ff4a4a',
        backgroundColor: 'rgba(255, 74, 74, 0.5)',
      }
    ],
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#2a2d3e] p-6">
        <h2 className="text-xl font-semibold mb-4">Training Progress</h2>
        <Progress value={65} className="mb-4" />
        <div className="text-sm text-gray-300">
          Epoch 32/50 - Loss: 0.234 - Accuracy: 96.5%
        </div>
      </Card>

      <Card className="bg-[#2a2d3e] p-6">
        <h2 className="text-xl font-semibold mb-4">Training Metrics</h2>
        <div className="h-[300px]">
          <Line options={options} data={data} ref={chartRef} />
        </div>
      </Card>
    </div>
  );
};

export default TrainingProgress;