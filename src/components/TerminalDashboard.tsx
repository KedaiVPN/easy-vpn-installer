
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

interface Account {
  username: string;
  type: "ssh" | "vmess" | "vless" | "trojan";
  created: string;
  expired: string;
  bandwidth: string;
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

  const [currentMenu, setCurrentMenu] = useState("main");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountType, setSelectedAccountType] = useState<"ssh" | "vmess" | "vless" | "trojan">("ssh");
  const [inputValue, setInputValue] = useState("");

  const handleMenuSelect = (option: string) => {
    switch (option) {
      case "1":
        setCurrentMenu("ssh");
        setSelectedAccountType("ssh");
        break;
      case "2":
        setCurrentMenu("xray");
        break;
      case "3":
        setCurrentMenu("bug");
        break;
      case "x":
        setCurrentMenu("main");
        break;
      default:
        break;
    }
  };

  const handleCreateAccount = () => {
    if (!inputValue) return;

    const newAccount: Account = {
      username: inputValue,
      type: selectedAccountType,
      created: new Date().toLocaleDateString(),
      expired: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      bandwidth: "0 GB",
    };

    setAccounts([...accounts, newAccount]);
    setInputValue("");
  };

  const renderMainMenu = () => (
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="col-span-2 grid grid-cols-2 gap-2">
        <div className="cursor-pointer hover:bg-gray-800 p-1 text-green-400">(1) SSH/OPENVPN MANAGER</div>
        <div className="cursor-pointer hover:bg-gray-800 p-1 text-green-400">(2) XRAY MANAGER</div>
      </div>
      <div className="col-span-2 grid grid-cols-2 gap-2">
        <div className="cursor-pointer hover:bg-gray-800 p-1 text-yellow-400">(3) CONFIG BUG/SNI</div>
        <div className="cursor-pointer hover:bg-gray-800 p-1">(x) EXIT</div>
      </div>
    </div>
  );

  const renderAccountMenu = () => (
    <div className="space-y-4">
      <div className="text-green-400 text-center border-b border-green-500 pb-2">
        [ {selectedAccountType.toUpperCase()} ACCOUNT MANAGER ]
      </div>
      
      <div className="space-y-2">
        <div>Create New Account:</div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="bg-gray-900 border border-green-500 p-1 w-full text-green-400"
          placeholder="Enter username"
        />
        <button
          onClick={handleCreateAccount}
          className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
        >
          Create
        </button>
      </div>

      <div className="space-y-2">
        <div className="text-green-400">Active Accounts:</div>
        <div className="space-y-1">
          {accounts
            .filter(account => account.type === selectedAccountType)
            .map((account, index) => (
              <div key={index} className="flex justify-between border-b border-gray-700 pb-1">
                <span>{account.username}</span>
                <span className="text-yellow-400">{account.expired}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => setCurrentMenu("main")}
          className="text-red-400 hover:text-red-300"
        >
          Back to Main Menu (x)
        </button>
      </div>
    </div>
  );

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

      {/* Menu Content */}
      {currentMenu === "main" ? renderMainMenu() : renderAccountMenu()}

      {/* Footer */}
      <div className="text-center border-t border-blue-500 pt-2">
        <div className="text-green-400 mt-2">Kesuksesan lahir dari keputusan untuk terus maju.</div>
        <div className="mt-2">
          Select From option [1-3 or x] : 
          <input
            type="text"
            className="bg-transparent border-none outline-none w-8 text-green-400 ml-1"
            value={inputValue}
            onChange={(e) => handleMenuSelect(e.target.value.toLowerCase())}
          />
          <span className="animate-pulse">_</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TerminalDashboard;
