
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Clock, HardDrive, Cpu, MemoryStick, Network } from "lucide-react";
import type { SystemRequirement } from "@/utils/types";

const requirements: SystemRequirement[] = [
  { name: "Root Access", status: "success", details: "User has root privileges" },
  { name: "System Updates", status: "pending", details: "Checking for system updates..." },
  { name: "Required Packages", status: "success", details: "All required packages are installed" },
  { name: "Swap Space", status: "success", details: "1GB swap space available" },
  { name: "CPU Usage", status: "success", details: "CPU load: 15%" },
  { name: "Memory Usage", status: "success", details: "Available: 2.5GB/4GB" },
  { name: "Disk Space", status: "success", details: "Available: 25GB/50GB" },
  { name: "Network Status", status: "success", details: "Connected (1Gbps)" },
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
            className="flex items-center justify-between p-3 bg-white rounded border hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {req.name.includes("CPU") && <Cpu className="w-4 h-4 text-gray-500" />}
              {req.name.includes("Memory") && <MemoryStick className="w-4 h-4 text-gray-500" />}
              {req.name.includes("Disk") && <HardDrive className="w-4 h-4 text-gray-500" />}
              {req.name.includes("Network") && <Network className="w-4 h-4 text-gray-500" />}
              <div>
                <span className="font-mono">{req.name}</span>
                {req.details && (
                  <p className="text-sm text-gray-500">{req.details}</p>
                )}
              </div>
            </div>
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
