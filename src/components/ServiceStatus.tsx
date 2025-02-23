
import { motion } from "framer-motion";
import type { ServiceStatus } from "@/utils/types";
import { Badge } from "@/components/ui/badge";
import { Settings2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const services: ServiceStatus[] = [
  {
    name: "Trojan",
    status: "running",
    port: 443,
    protocol: "WebSocket/gRPC",
  },
  {
    name: "Shadowsocks",
    status: "running",
    port: 443,
    protocol: "WebSocket/gRPC",
  },
  {
    name: "VMESS",
    status: "running",
    port: 443,
    protocol: "WebSocket/gRPC/TCP",
  },
  {
    name: "VLESS",
    status: "running",
    port: 443,
    protocol: "WebSocket/gRPC/TCP",
  },
];

export const ServiceStatusPanel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Service Status</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Settings2 className="w-5 h-5 text-gray-600" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Configure Services</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.name}
            className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{service.name}</h3>
              <Badge
                variant={service.status === "running" ? "default" : "destructive"}
              >
                {service.status}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="flex justify-between">
                <span>Port:</span>
                <span className="font-mono">{service.port}</span>
              </p>
              <p className="flex justify-between">
                <span>Protocol:</span>
                <span className="font-mono">{service.protocol}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
