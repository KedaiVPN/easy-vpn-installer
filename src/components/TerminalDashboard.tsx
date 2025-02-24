import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Terminal } from "lucide-react";

interface SystemInfo {
  client: string;
  ram: string;
  ip: string;
  expired: string;
  rx: string;
  tx: string;
  speed: string;
  os: string;
  uptime: string;
  isp: string;
  domain: string;
  lastUsage: string;
  todayUsage: string;
  monthUsage: string;
}

interface ServiceStatus {
  proxy: boolean;
  nginx: boolean;
  ssh: boolean;
  xray: boolean;
  sshAccounts: number;
  xrayAccounts: number;
}

const TerminalDashboard = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    client: "kedai_vpn",
    ram: "3916 MB",
    ip: "157.245.149.231",
    expired: "12 Day",
    rx: "3.77 GB",
    tx: "3.45 GB",
    speed: "0.00 Mbps",
    os: "Ubuntu 22.04.5 LTS",
    uptime: "3 hours, 11 minutes",
    isp: "DigitalOcean, LLC",
    domain: "sg2prem.kedaivpn.cloud",
    lastUsage: "178.87 GB",
    todayUsage: "7.21 GB",
    monthUsage: "■■■□□□□□□□",
  });

  const [services, setServices] = useState<ServiceStatus>({
    proxy: true,
    nginx: true,
    ssh: true,
    xray: true,
    sshAccounts: 27,
    xrayAccounts: 11,
  });

  const menuItems = [
    ["SSH/OPENVPN", "ADMIN MENU"],
    ["XRAY MANAGER", "BOT TELEGRAM"],
    ["ADD BUG CONFIG", "UPDATE SCRIPT"],
    ["CHANGE WARNA", "BACKUP & RESTORE"],
    ["REGISTER IP", "FEATURES"],
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-mono text-sm bg-gray-900 text-green-400 p-6 rounded-lg shadow-xl w-full max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-4 border-b border-blue-500 pb-2">
        <div className="text-green-400">[ LAMPUNG-STORE ~ V1.9.9 ]</div>
      </div>

      {/* System Information */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <div>CLIENT : <span className="text-red-400">{systemInfo.client}</span></div>
          <div>RAM    : <span className="text-green-400">{systemInfo.ram}</span></div>
          <div>IP     : <span>{systemInfo.ip}</span></div>
          <div>EXPIRED: <span>{systemInfo.expired}</span></div>
          <div>RX     : <span className="text-cyan-400">{systemInfo.rx}</span></div>
          <div>TX     : <span className="text-cyan-400">{systemInfo.tx}</span></div>
          <div>SPEED  : <span>{systemInfo.speed}</span></div>
        </div>
        <div className="space-y-1">
          <div>OS     : <span className="text-green-400">{systemInfo.os}</span></div>
          <div>UPTIME : <span className="text-green-400">{systemInfo.uptime}</span></div>
          <div>ISP    : <span>{systemInfo.isp}</span></div>
          <div>DOMAIN : <span>{systemInfo.domain}</span></div>
          <div>LAST   : <span>{systemInfo.lastUsage}</span></div>
          <div>TODAY  : <span>{systemInfo.todayUsage}</span></div>
          <div>MONTH  : <span className="text-red-500">{systemInfo.monthUsage}</span></div>
        </div>
      </div>

      {/* Service Status */}
      <div className="mb-4">
        <div className="text-center text-yellow-400 mb-2">[ SERVICE STATUS - GOOD ]</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            PROXY : <span className={services.proxy ? "text-green-400" : "text-red-400"}>ON</span>
            {"  "}SSH : <span className={services.ssh ? "text-green-400" : "text-red-400"}>ON</span>
          </div>
          <div>
            ACCOUNT : <span className="text-green-400">{services.sshAccounts}</span>
          </div>
          <div>
            NGINX : <span className={services.nginx ? "text-green-400" : "text-red-400"}>ON</span>
            {"  "}XRAY : <span className={services.xray ? "text-green-400" : "text-red-400"}>ON</span>
          </div>
          <div>
            ACCOUNT : <span className="text-green-400">{services.xrayAccounts}</span>
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {menuItems.map((row, i) => (
          <div key={i} className="col-span-2 grid grid-cols-2 gap-2">
            {row.map((item, j) => (
              <div key={j} className="cursor-pointer hover:bg-gray-800 p-1">
                ({i * 2 + j + 1}) {item}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center border-t border-blue-500 pt-2">
        <div className="text-red-400">[ REBOOT SYSTEM ]</div>
        <div className="text-white">[ EXIT ]</div>
        <div className="text-green-400 mt-2">Kesuksesan lahir dari keputusan untuk terus maju.</div>
        <div className="mt-2">Select From option [1/10 or x] : <span className="animate-pulse">_</span></div>
      </div>
    </motion.div>
  );
};

export default TerminalDashboard;
