
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import type { SystemRequirement } from "@/utils/types";

const requirements: SystemRequirement[] = [
  { name: "Root Access", status: "success" },
  { name: "System Updates", status: "pending" },
  { name: "Required Packages", status: "success" },
  { name: "Swap Space", status: "success" },
];

export const SystemCheck = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg"
    >
      <h2 className="text-xl font-semibold mb-4">System Requirements</h2>
      <div className="space-y-3">
        {requirements.map((req) => (
          <div
            key={req.name}
            className="flex items-center justify-between p-3 bg-white rounded border"
          >
            <span className="font-mono">{req.name}</span>
            {req.status === "success" && (
              <CheckCircle className="text-success w-5 h-5" />
            )}
            {req.status === "pending" && (
              <Clock className="text-yellow-500 w-5 h-5" />
            )}
            {req.status === "error" && (
              <AlertCircle className="text-red-500 w-5 h-5" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
