
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const settings = [
  { name: "SSL/TLS", value: "FULL" },
  { name: "SSL/TLS Recommender", value: "OFF" },
  { name: "gRPC", value: "ON" },
  { name: "WebSocket", value: "ON" },
  { name: "Always Use HTTPS", value: "OFF" },
  { name: "Under Attack Mode", value: "OFF" },
];

export const CloudflareGuide = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg"
    >
      <h2 className="text-xl font-semibold mb-4">Cloudflare Configuration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settings.map((setting) => (
          <div
            key={setting.name}
            className="flex items-center justify-between p-3 bg-white rounded border"
          >
            <span className="font-mono">{setting.name}</span>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 rounded text-sm ${
                  setting.value === "ON" || setting.value === "FULL"
                    ? "bg-success/10 text-success"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {setting.value}
              </span>
              <CheckCircle className="text-success w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
