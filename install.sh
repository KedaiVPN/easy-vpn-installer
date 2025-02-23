
#!/bin/bash

# ====================
# Easy VPN Installer
# Author: KedaiVPN
# Version: 2.1.0
# ====================

# Konfigurasi Default
SWAP_SIZE=1024  # Ukuran swap dalam MB
XRAY_PORT=443   # Port default untuk Xray
SSH_PORT=22     # Port default untuk SSH
LOG_FILE="/var/log/easy-vpn-installer.log"
CONFIG_FILE="config.conf"
BACKUP_DIR="/root/vpn-backup"
CERT_DIR="/etc/ssl/private"
MONITORING_INTERVAL=5  # Interval monitoring dalam menit

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ... keep existing code (fungsi logging, check_error, check_root, update_system, setup_swap)

# Fungsi backup konfigurasi
backup_config() {
    log "INFO" "Memulai backup konfigurasi..."
    
    # Buat direktori backup jika belum ada
    mkdir -p "${BACKUP_DIR}"
    check_error "Gagal membuat direktori backup"
    
    # Backup konfigurasi utama
    BACKUP_FILE="${BACKUP_DIR}/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "${BACKUP_FILE}" \
        /usr/local/etc/xray \
        /etc/ssl/private \
        /etc/fail2ban \
        "${LOG_FILE}" \
        2>/dev/null
    
    check_error "Gagal membuat backup" "warning"
    log "INFO" "Backup selesai: ${BACKUP_FILE}"
}

# Fungsi pembuatan SSL otomatis dengan Let's Encrypt
setup_ssl() {
    local domain=$1
    log "INFO" "Memulai setup SSL untuk domain ${domain}..."
    
    # Install certbot
    apt install -y certbot
    check_error "Gagal menginstall certbot" "critical"
    
    # Generate sertifikat
    certbot certonly --standalone -d "${domain}" --non-interactive --agree-tos --email admin@"${domain}" \
        --preferred-challenges http
    check_error "Gagal mendapatkan sertifikat SSL" "critical"
    
    # Salin sertifikat ke direktori Xray
    cp /etc/letsencrypt/live/"${domain}"/fullchain.pem "${CERT_DIR}/xray.crt"
    cp /etc/letsencrypt/live/"${domain}"/privkey.pem "${CERT_DIR}/xray.key"
    check_error "Gagal menyalin sertifikat" "critical"
    
    log "INFO" "Setup SSL selesai untuk ${domain}"
}

# Fungsi monitoring resource
setup_monitoring() {
    log "INFO" "Mengatur monitoring sistem..."
    
    # Install tools monitoring
    apt install -y sysstat net-tools
    check_error "Gagal menginstall tools monitoring"
    
    # Buat script monitoring
    cat > /usr/local/bin/monitor-vpn.sh <<EOF
#!/bin/bash
while true; do
    echo "=== VPN Server Monitoring ===" >> "${LOG_FILE}"
    date >> "${LOG_FILE}"
    echo "CPU Usage:" >> "${LOG_FILE}"
    top -bn1 | head -n 3 >> "${LOG_FILE}"
    echo "Memory Usage:" >> "${LOG_FILE}"
    free -m >> "${LOG_FILE}"
    echo "Network Connections:" >> "${LOG_FILE}"
    netstat -an | grep :${XRAY_PORT} | wc -l >> "${LOG_FILE}"
    echo "===========================" >> "${LOG_FILE}"
    sleep ${MONITORING_INTERVAL}m
done
EOF
    
    chmod +x /usr/local/bin/monitor-vpn.sh
    
    # Buat service systemd untuk monitoring
    cat > /etc/systemd/system/vpn-monitor.service <<EOF
[Unit]
Description=VPN Server Monitoring
After=network.target

[Service]
ExecStart=/usr/local/bin/monitor-vpn.sh
Restart=always

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable vpn-monitor
    systemctl start vpn-monitor
    
    check_error "Gagal mengatur monitoring"
    log "INFO" "Monitoring sistem berhasil diatur"
}

# Fungsi manajemen user
manage_users() {
    local action=$1
    local username=$2
    local password=$3
    
    case "${action}" in
        "add")
            log "INFO" "Menambah user: ${username}"
            useradd -m -s /bin/false "${username}"
            echo "${username}:${password}" | chpasswd
            check_error "Gagal menambah user"
            
            # Generate konfigurasi Xray untuk user
            UUID=$(cat /proc/sys/kernel/random/uuid)
            # Tambahkan UUID ke konfigurasi Xray
            # ... implementasi penambahan user ke config.json
            ;;
            
        "delete")
            log "INFO" "Menghapus user: ${username}"
            userdel -r "${username}"
            check_error "Gagal menghapus user"
            # Hapus konfigurasi Xray untuk user
            ;;
            
        "list")
            log "INFO" "Daftar user aktif:"
            awk -F: '$3 >= 1000 && $1 != "nobody" {print $1}' /etc/passwd
            ;;
    esac
}

# Fungsi instalasi dan konfigurasi Xray
install_xray() {
    # ... keep existing code (instalasi Xray)
    
    # Tambahan: setup monitoring setelah instalasi
    setup_monitoring
}

# Main function
main() {
    # Buat file log jika belum ada
    touch "$LOG_FILE"
    log "INFO" "Memulai instalasi Easy VPN..."
    
    # Jalankan fungsi-fungsi utama
    check_root
    update_system
    setup_swap
    install_xray
    setup_security
    optimize_system
    
    # Backup konfigurasi awal
    backup_config
    
    # Setup SSL jika domain tersedia
    if [ ! -z "${DOMAIN}" ]; then
        setup_ssl "${DOMAIN}"
    fi
    
    log "INFO" "Instalasi selesai! Log tersimpan di $LOG_FILE"
}

# Load konfigurasi custom jika ada
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
    log "INFO" "Menggunakan konfigurasi dari $CONFIG_FILE"
fi

# Jalankan script
main
