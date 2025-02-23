
import { motion } from "framer-motion";
import type { ServiceStatus } from "@/utils/types";
import { Badge } from "@/components/ui/badge";

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
      <h2 className="text-xl font-semibold mb-4">Service Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.name}
            className="p-4 rounded-lg border border-gray-200"
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
              <p>Port: {service.port}</p>
              <p>Protocol: {service.protocol}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
