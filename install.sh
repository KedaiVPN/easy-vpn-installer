#!/bin/bash

# ====================
# Easy VPN Installer
# Author: KedaiVPN
# Version: 2.2.0 
# ====================

# Konfigurasi Default
SWAP_SIZE=1024                    # Ukuran swap dalam MB
XRAY_PORT=443                     # Port default untuk Xray
SSH_PORT=22                       # Port default untuk SSH
WS_PORT=80                       # Port untuk WebSocket non-TLS
GRPC_PORT=443                     # Port untuk gRPC
LOG_FILE="/var/log/easy-vpn-installer.log"
CONFIG_FILE="config.conf"
BACKUP_DIR="/root/vpn-backup"
CERT_DIR="/etc/ssl/private"
MONITORING_INTERVAL=5             # Interval monitoring dalam menit
LOG_CLEANUP_INTERVAL=3            # Interval pembersihan log dalam menit
FAIL2BAN_MAX_RETRY=5             # Maksimal percobaan login gagal
FAIL2BAN_BANTIME=3600            # Waktu ban dalam detik
KERNEL_BBR=true                  # Aktifkan BBR TCP congestion control

# Cloudflare settings
CF_SSL_MODE="full"               # full/flexible/strict
CF_GRPC="on"                     # on/off
CF_WEBSOCKET="on"               # on/off
CF_ALWAYS_HTTPS="off"           # on/off
CF_UNDER_ATTACK="off"           # on/off

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fungsi logging yang ditingkatkan
log() {
    local level=$1
    local message=$2
    local critical=$3
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Log ke file
    echo -e "${timestamp} [${level}] ${message}" >> "$LOG_FILE"
    
    # Output ke console dengan warna
    case $level in
        "INFO")     echo -e "${GREEN}[INFO]${NC} ${message}" ;;
        "WARNING")  echo -e "${YELLOW}[WARNING]${NC} ${message}" ;;
        "ERROR")    echo -e "${RED}[ERROR]${NC} ${message}" ;;
        "PROGRESS") echo -e "${BLUE}[PROGRESS]${NC} ${message}" ;;
    esac
    
    # Jika critical, exit
    if [ "$critical" = "true" ]; then
        log "ERROR" "Terjadi kesalahan kritis. Menghentikan instalasi."
        exit 1
    fi
}

# Fungsi untuk memeriksa versi OS yang didukung
check_os_support() {
    # Deteksi OS dan versi
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    else
        log "ERROR" "Tidak dapat mendeteksi sistem operasi" true
    fi

    # Cek Ubuntu
    if [ "$OS" = "ubuntu" ]; then
        if [[ "$VER" == "20.04" || "$VER" == "22.04" || "$VER" == "23.04" || "$VER" == "23.10" || "$VER" == "24.04" ]]; then
            log "INFO" "Terdeteksi Ubuntu $VER - Versi yang didukung"
            return 0
        else
            log "ERROR" "Ubuntu $VER tidak didukung. Hanya mendukung versi 20.04.05 - 24.04" true
        fi
    # Cek Debian
    elif [ "$OS" = "debian" ]; then
        if [[ "$VER" == "10" || "$VER" == "11" || "$VER" == "12" ]]; then
            log "INFO" "Terdeteksi Debian $VER - Versi yang didukung"
            return 0
        else
            log "ERROR" "Debian $VER tidak didukung. Hanya mendukung versi 10 - 12" true
        fi
    else
        log "ERROR" "Sistem operasi $OS tidak didukung. Hanya mendukung Ubuntu dan Debian" true
    fi
}

# Fungsi pengecekan dan setup awal
pre_installation_check() {
    # Cek root access
    if [[ $EUID -ne 0 ]]; then
        log "ERROR" "Script ini harus dijalankan sebagai root" true
    fi
    
    # Cek OS support
    check_os_support
    
    # Cek koneksi internet
    if ! ping -c 1 google.com &>/dev/null; then
        log "ERROR" "Tidak ada koneksi internet" true
    fi
    
    log "INFO" "Pre-installation check berhasil"
}

# Fungsi update sistem yang ditingkatkan
update_system() {
    log "PROGRESS" "Memulai update sistem..."
    
    # Update package list
    apt update
    check_error "Gagal update package list" true
    
    # Upgrade sistem
    apt upgrade -y
    check_error "Gagal upgrade sistem" true
    
    # Install paket yang diperlukan
    log "PROGRESS" "Menginstall paket-paket yang diperlukan..."
    apt install -y wget curl screen sudo whois fail2ban ufw net-tools
    check_error "Gagal install paket yang diperlukan" true
    
    log "INFO" "Update sistem selesai"
}

# Fungsi konfigurasi swap yang ditingkatkan
setup_swap() {
    log "PROGRESS" "Memeriksa dan mengatur swap..."
    
    # Cek existing swap
    if free | awk '/^Swap:/ {exit !$2}'; then
        local current_swap=$(free -m | awk '/^Swap:/ {print $2}')
        if [ "$current_swap" -ge "$SWAP_SIZE" ]; then
            log "INFO" "Swap sudah ada dan ukurannya mencukupi (${current_swap}MB)"
            return 0
        else
            log "WARNING" "Swap ada tapi ukurannya kurang (${current_swap}MB). Menambah swap..."
            swapoff -a
            rm -f /swapfile
        fi
    fi
    
    # Buat swap baru
    log "PROGRESS" "Membuat swap file ${SWAP_SIZE}MB..."
    fallocate -l ${SWAP_SIZE}M /swapfile
    check_error "Gagal membuat swap file" true
    
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    
    # Tambahkan ke fstab jika belum ada
    if ! grep -q "/swapfile" /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
    
    log "INFO" "Setup swap selesai"
}

# Fungsi instalasi dan konfigurasi Xray yang ditingkatkan
install_xray() {
    log "PROGRESS" "Menginstall Xray Core..."
    
    # Download dan install Xray
    bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install
    check_error "Gagal menginstall Xray Core" true
    
    # Buat direktori untuk sertifikat
    mkdir -p /usr/local/etc/xray
    mkdir -p "${CERT_DIR}"
    
    # Konfigurasi Xray untuk multiple protokol
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
                        "path": "/vless-ws"
                    },
                    {
                        "dest": 8081,
                        "path": "/vmess-ws"
                    },
                    {
                        "dest": 8082,
                        "path": "/trojan-ws"
                    },
                    {
                        "dest": 8083,
                        "path": "/shadowsocks-ws"
                    },
                    {
                        "dest": 8443,
                        "alpn": "h2"
                    }
                ]
            },
            "streamSettings": {
                "network": "tcp",
                "security": "tls",
                "tlsSettings": {
                    "certificates": [
                        {
                            "certificateFile": "${CERT_DIR}/xray.crt",
                            "keyFile": "${CERT_DIR}/xray.key"
                        }
                    ],
                    "alpn": ["h2", "http/1.1"]
                }
            }
        },
        {
            "port": ${WS_PORT},
            "protocol": "vless",
            "settings": {
                "clients": [
                    {
                        "id": "$(cat /proc/sys/kernel/random/uuid)"
                    }
                ],
                "decryption": "none"
            },
            "streamSettings": {
                "network": "ws",
                "wsSettings": {
                    "path": "/vless-ws"
                }
            }
        }
    ],
    "outbounds": [
        {
            "protocol": "freedom"
        }
    ]
}
EOF
    
    # Restart Xray
    systemctl restart xray
    check_error "Gagal restart Xray" true
    
    log "INFO" "Instalasi dan konfigurasi Xray selesai"
}

# Fungsi pengaturan keamanan yang ditingkatkan
setup_security() {
    log "PROGRESS" "Mengatur konfigurasi keamanan..."
    
    # Konfigurasi fail2ban
    cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = ${FAIL2BAN_BANTIME}
findtime = 600
maxretry = ${FAIL2BAN_MAX_RETRY}

[sshd]
enabled = true
port = ${SSH_PORT}
EOF
    
    systemctl restart fail2ban
    check_error "Gagal mengkonfigurasi fail2ban"
    
    # Setup firewall (UFW)
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ${SSH_PORT}/tcp
    ufw allow ${XRAY_PORT}/tcp
    ufw allow ${WS_PORT}/tcp
    ufw --force enable
    
    # Konfigurasi pembersihan log otomatis
    cat > /etc/cron.d/cleanup-logs <<EOF
*/${LOG_CLEANUP_INTERVAL} * * * * root find /var/log -type f -name "*.log" -size +100M -delete
EOF
    
    # Pengaturan kernel untuk keamanan
    cat >> /etc/sysctl.conf <<EOF
# Pengaturan keamanan kernel
net.ipv4.tcp_syncookies = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
EOF
    
    sysctl -p
    
    log "INFO" "Pengaturan keamanan selesai"
}

# Fungsi optimasi sistem yang ditingkatkan
optimize_system() {
    log "PROGRESS" "Mengoptimasi sistem..."
    
    # Optimasi kernel
    cat > /etc/sysctl.d/99-vpn-optimize.conf <<EOF
# Optimasi TCP/IP Stack
net.core.rmem_max = 67108864
net.core.wmem_max = 67108864
net.core.rmem_default = 65536
net.core.wmem_default = 65536
net.ipv4.tcp_rmem = 4096 87380 67108864
net.ipv4.tcp_wmem = 4096 65536 67108864
net.ipv4.tcp_congestion_control = bbr
net.core.default_qdisc = fq
net.ipv4.tcp_fastopen = 3
net.ipv4.tcp_slow_start_after_idle = 0
EOF
    
    # Aktifkan BBR jika diminta
    if [ "${KERNEL_BBR}" = true ]; then
        modprobe tcp_bbr
        echo "tcp_bbr" >> /etc/modules-load.d/modules.conf
    fi
    
    # Terapkan perubahan
    sysctl --system
    check_error "Gagal menerapkan optimasi sistem"
    
    log "INFO" "Optimasi sistem selesai"
}

# Main function yang ditingkatkan
main() {
    # Buat file log jika belum ada
    touch "$LOG_FILE"
    chmod 644 "$LOG_FILE"
    
    log "PROGRESS" "Memulai instalasi Easy VPN..."
    
    # Load konfigurasi custom
    if [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
        log "INFO" "Menggunakan konfigurasi dari $CONFIG_FILE"
    fi
    
    # Jalankan semua fungsi secara berurutan
    pre_installation_check
    update_system
    setup_swap
    install_xray
    setup_security
    optimize_system
    setup_monitoring
    backup_config
    
    # Setup SSL jika domain tersedia
    if [ ! -z "${DOMAIN}" ]; then
        setup_ssl "${DOMAIN}"
    fi
    
    log "INFO" "============================================"
    log "INFO" "Instalasi selesai! Log tersimpan di $LOG_FILE"
    log "INFO" "============================================"
}

# Jalankan script
main
