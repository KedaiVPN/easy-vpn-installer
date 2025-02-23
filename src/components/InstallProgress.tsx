
import { motion } from "framer-motion";
import type { InstallationStep } from "@/utils/types";
import { Progress } from "@/components/ui/progress";

const steps: InstallationStep[] = [
  {
    name: "System Preparation",
    status: "completed",
    description: "Updating system and installing dependencies",
  },
  {
    name: "VPN Services",
    status: "in-progress",
    description: "Installing and configuring Xray Core",
  },
  {
    name: "Security Setup",
    status: "pending",
    description: "Configuring fail2ban and security measures",
  },
  {
    name: "Optimization",
    status: "pending",
    description: "Tuning server performance",
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
                : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{step.name}</h3>
              <span
                className={`text-sm px-2 py-1 rounded ${
                  step.status === "completed"
                    ? "bg-success/10 text-success"
                    : step.status === "in-progress"
                    ? "bg-yellow-50 text-yellow-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {step.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
