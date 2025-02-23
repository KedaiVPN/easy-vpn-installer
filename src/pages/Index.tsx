
import { motion } from "framer-motion";
import { SystemCheck } from "@/components/SystemCheck";
import { InstallProgress } from "@/components/InstallProgress";
import { ServiceStatus } from "@/components/ServiceStatus";
import { UserManagement } from "@/components/UserManagement";
import { CloudflareGuide } from "@/components/CloudflareGuide";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-8"
        >
          VPN Auto-Installer Dashboard
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <SystemCheck />
          <InstallProgress />
        </div>
        <div className="mb-6">
          <ServiceStatus />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UserManagement />
          <CloudflareGuide />
        </div>
      </div>
    </div>
  );
};

export default Index;
