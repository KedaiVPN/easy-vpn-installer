
#!/bin/bash

# ====================
# Easy VPN Installer
# Author: KedaiVPN
# Version: 2.0.0
# ====================

# Konfigurasi Default
SWAP_SIZE=1024  # Ukuran swap dalam MB
XRAY_PORT=443   # Port default untuk Xray
SSH_PORT=22     # Port default untuk SSH
LOG_FILE="/var/log/easy-vpn-installer.log"
CONFIG_FILE="config.conf"

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Fungsi logging
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" >> "$LOG_FILE"
    
    case $level in
        "INFO") echo -e "${GREEN}[INFO]${NC} $message" ;;
        "WARNING") echo -e "${YELLOW}[WARNING]${NC} $message" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" ;;
    esac
}

# Fungsi pengecekan error
check_error() {
    if [ $? -ne 0 ]; then
        log "ERROR" "$1"
        if [ "$2" = "critical" ]; then
            log "ERROR" "Instalasi dibatalkan karena error kritis"
            exit 1
        fi
        return 1
    fi
    return 0
}

# Fungsi pengecekan root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log "ERROR" "Script ini harus dijalankan sebagai root" "critical"
        exit 1
    fi
    log "INFO" "Menjalankan script sebagai root"
}

# Fungsi update sistem
update_system() {
    log "INFO" "Memulai update sistem..."
    apt update && apt upgrade -y
    check_error "Gagal melakukan update sistem" "critical"
    
    log "INFO" "Menginstall paket-paket yang diperlukan..."
    apt install -y wget curl screen sudo whois fail2ban
    check_error "Gagal menginstall paket yang diperlukan" "critical"
}

# Fungsi konfigurasi swap
setup_swap() {
    log "INFO" "Memeriksa swap yang ada..."
    if free | awk '/^Swap:/ {exit !$2}'; then
        log "WARNING" "Swap sudah ada. Melewati pembuatan swap."
        return 0
    fi

    log "INFO" "Membuat swap file ${SWAP_SIZE}MB..."
    fallocate -l ${SWAP_SIZE}M /swapfile
    check_error "Gagal membuat swap file"
    
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    
    log "INFO" "Swap berhasil dikonfigurasi"
}

# Fungsi instalasi dan konfigurasi Xray
install_xray() {
    log "INFO" "Menginstall Xray Core..."
    bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install
    check_error "Gagal menginstall Xray Core" "critical"
    
    # Konfigurasi Xray untuk berbagai protokol
    cat > /usr/local/etc/xray/config.json <<EOF
{
    "log": {
        "access": "/var/log/xray/access.log",
        "error": "/var/log/xray/error.log",
        "loglevel": "warning"
    },
    "inbounds": [
        {
            "port": ${XRAY_PORT},
            "protocol": "vless",
            "settings": {
                "clients": [
                    {
                        "id": "$(cat /proc/sys/kernel/random/uuid)",
                        "flow": "xtls-rprx-direct"
                    }
                ],
                "decryption": "none",
                "fallbacks": [
                    {
                        "dest": 8080,
                        "path": "/vless"
                    },
                    {
                        "dest": 8081,
                        "path": "/vmess"
                    },
                    {
                        "dest": 8082,
                        "path": "/trojan"
                    },
                    {
                        "dest": 8083,
                        "path": "/shadowsocks"
                    }
                ]
            },
            "streamSettings": {
                "network": "tcp",
                "security": "tls",
                "tlsSettings": {
                    "certificates": [
                        {
                            "certificateFile": "/path/to/cert.crt",
                            "keyFile": "/path/to/private.key"
                        }
                    ]
                }
            }
        }
    ]
}
EOF
    
    log "INFO" "Xray Core berhasil dikonfigurasi"
}

# Fungsi konfigurasi keamanan
setup_security() {
    log "INFO" "Mengkonfigurasi fail2ban..."
    cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
    cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ${SSH_PORT}
EOF
    
    systemctl restart fail2ban
    check_error "Gagal mengkonfigurasi fail2ban"
    
    # Konfigurasi pembersihan log otomatis
    cat > /etc/cron.d/clear-logs <<EOF
*/3 * * * * root find /var/log -type f -name "*.log" -size +100M -delete
EOF
    
    log "INFO" "Konfigurasi keamanan selesai"
}

# Fungsi optimasi sistem
optimize_system() {
    log "INFO" "Mengoptimasi parameter kernel..."
    cat > /etc/sysctl.d/99-vpn-optimize.conf <<EOF
net.ipv4.tcp_fastopen = 3
net.ipv4.tcp_slow_start_after_idle = 0
net.ipv4.tcp_retries2 = 8
net.ipv4.tcp_limit_output_bytes = 131072
EOF
    
    sysctl --system
    check_error "Gagal mengoptimasi sistem"
    
    log "INFO" "Sistem berhasil dioptimasi"
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
    
    log "INFO" "Instalasi selesai! Log tersimpan di $LOG_FILE"
}

# Load konfigurasi custom jika ada
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
    log "INFO" "Menggunakan konfigurasi dari $CONFIG_FILE"
fi

# Jalankan script
main
