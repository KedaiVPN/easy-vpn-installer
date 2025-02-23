
import { motion } from "framer-motion";
import type { InstallationStep } from "@/utils/types";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

const steps: InstallationStep[] = [
  {
    name: "System Preparation",
    status: "completed",
    description: "Updating system and installing dependencies",
    timestamp: new Date("2024-02-20T10:00:00"),
  },
  {
    name: "VPN Services",
    status: "in-progress",
    description: "Installing and configuring Xray Core",
    timestamp: new Date("2024-02-20T10:05:00"),
  },
  {
    name: "Security Setup",
    status: "pending",
    description: "Configuring fail2ban and security measures",
  },
  {
    name: "Optimization",
    status: "error",
    description: "Tuning server performance",
    errorDetails: "Failed to optimize kernel parameters. Permission denied.",
    timestamp: new Date("2024-02-20T10:15:00"),
  },
];

export const InstallProgress = () => {
  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg"
    >
      <h2 className="text-xl font-semibold mb-4">Installation Progress</h2>
      <Progress value={progress} className="mb-6" />
      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.name}
            className={`p-4 rounded-lg border ${
              step.status === "in-progress"
                ? "border-success bg-success/5"
                : step.status === "error"
                ? "border-red-200 bg-red-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="font-semibold">{step.name}</h3>
                {step.timestamp && (
                  <p className="text-xs text-gray-500">
                    {step.timestamp.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <span
                className={`text-sm px-2 py-1 rounded ${
                  step.status === "completed"
                    ? "bg-success/10 text-success"
                    : step.status === "in-progress"
                    ? "bg-yellow-50 text-yellow-600"
                    : step.status === "error"
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {step.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">{step.description}</p>
            {step.errorDetails && (
              <div className="mt-2 p-2 bg-red-100 rounded-md flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                <p className="text-sm text-red-600">{step.errorDetails}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
