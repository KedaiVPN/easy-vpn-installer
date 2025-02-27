
#!/bin/bash

# Update package list
apt-get update

# Install nodejs dan npm jika belum ada
if ! command -v node &> /dev/null; then
    apt-get install -y nodejs npm
fi

# Install vnstat untuk monitoring bandwidth jika belum ada
if ! command -v vnstat &> /dev/null; then
    apt-get install -y vnstat
    systemctl enable vnstat
    systemctl start vnstat
fi

# Buat folder status.json jika belum ada
mkdir -p /var/www/html/dashboard
touch /var/www/html/dashboard/status.json

# Tulis status.json awal
cat > /var/www/html/dashboard/status.json << EOF
{
  "systemInfo": {
    "ram": "Calculating...",
    "uptime": "Calculating...",
    "bandwidth": "Calculating...",
    "todayUsage": "0.00 GB",
    "monthUsage": "0.00 GB",
    "rx": "0.00 GB",
    "tx": "0.00 GB"
  },
  "services": {
    "ssh": true,
    "nginx": true,
    "xray": true
  }
}
EOF

# Set permission
chmod +x /var/www/html/dashboard/server.js
chown -R www-data:www-data /var/www/html/dashboard

# Update script untuk update status.json setiap 5 menit
cat > /usr/local/bin/update-dashboard-info << EOF
#!/bin/bash

# Update system info
memory_info=\$(free -m | awk '/Mem:/ {print \$2}')
used_mem=\$(free -m | awk '/Mem:/ {print \$3}')
uptime_info=\$(uptime -p)
rx_tx=\$(vnstat -tr 1 | grep "rx/tx" | awk '{print \$2" "\$3" / "\$5" "\$6}')
today_usage=\$(vnstat -d 1 | grep "`date +"%Y-%m-%d"`" | awk '{print \$2" "\$3}')
month_usage=\$(vnstat -m | grep "`date +"%b '%y"`" | awk '{print \$2" "\$3}')

# Write to status file
cat > /var/www/html/dashboard/status.json <<INNER_EOF
{
  "systemInfo": {
    "ram": "\${memory_info} MB",
    "uptime": "\${uptime_info}",
    "bandwidth": "\${rx_tx}",
    "todayUsage": "\${today_usage:-0.00 KB}",
    "monthUsage": "\${month_usage:-0.00 KB}",
    "rx": "\${rx_tx:-0.00 KB/s}",
    "tx": "\${rx_tx:-0.00 KB/s}"
  },
  "services": {
    "ssh": \$(systemctl is-active ssh >/dev/null 2>&1 && echo true || echo false),
    "nginx": \$(systemctl is-active nginx >/dev/null 2>&1 && echo true || echo false),
    "xray": \$(systemctl is-active xray >/dev/null 2>&1 && echo true || echo false)
  }
}
INNER_EOF
EOF

# Buat executable
chmod +x /usr/local/bin/update-dashboard-info

# Tambahkan ke crontab untuk update regular
if ! crontab -l | grep -q "update-dashboard-info"; then
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/update-dashboard-info") | crontab -
fi

# Restart services
systemctl daemon-reload
systemctl restart vpn-dashboard
systemctl restart nginx

echo "Dashboard dependencies setup completed"
