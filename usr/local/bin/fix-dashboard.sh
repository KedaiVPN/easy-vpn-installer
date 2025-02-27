
#!/bin/bash

# Fix dashboard service
echo "[+] Memperbaiki vpn-dashboard.service..."
cat > /etc/systemd/system/vpn-dashboard.service << EOF
[Unit]
Description=VPN Dashboard API Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/html/dashboard
ExecStart=/usr/bin/node /var/www/html/dashboard/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Jalankan script setup dependencies
echo "[+] Menginstall dependencies..."
bash /usr/local/bin/setup-dashboard-deps.sh

# Restart service
echo "[+] Merestart service..."
systemctl daemon-reload
systemctl restart vpn-dashboard

# Tampilkan status service
echo "[+] Status service sekarang:"
systemctl status vpn-dashboard --no-pager

echo "[+] URLs dashboard:"
IP=$(curl -s ifconfig.me)
echo "- http://$IP:8080/dashboard"
echo "- http://$IP:3000/dashboard (jika menggunakan port 3000)"
echo "- http://$IP/dashboard (jika sudah disetup di nginx)"

echo "[+] Proses fix dashboard selesai!"
