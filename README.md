
# Easy VPN Installer

Script auto-installer untuk konfigurasi VPN dan proxy multi protokol pada server Linux (Debian/Ubuntu).

## Fitur

- Instalasi dan konfigurasi otomatis Xray Core dengan dukungan:
  - VLESS (WebSocket, gRPC, TCP)
  - VMESS (WebSocket, gRPC)
  - Trojan (WebSocket, gRPC)
  - Shadowsocks (WebSocket, gRPC)
- Konfigurasi SSH dengan WebSocket/TLS
- Pengaturan keamanan (fail2ban, firewall)
- Optimasi sistem dan kernel
- Monitoring resource dan log otomatis
- Backup konfigurasi otomatis

## Persyaratan Sistem

- OS: Debian 10+ atau Ubuntu 18.04+
- RAM: Minimal 1GB
- CPU: 1 Core
- Akses root

## Instalasi Cepat

Salin dan tempelkan perintah berikut ke terminal server Anda:

```bash
apt update -y && apt install -y wget curl screen sudo && \
wget -q https://raw.githubusercontent.com/KedaiVPN/easy-vpn-installer/main/install.sh && \
chmod +x install.sh && \
screen -S install ./install.sh
```

### Penjelasan Langkah Instalasi

1. `apt update -y`
   - Memperbarui daftar paket sistem
   - Flag `-y` untuk menyetujui pembaruan secara otomatis

2. `apt install -y wget curl screen sudo`
   - Menginstal paket-paket yang diperlukan:
     - wget: untuk mengunduh file
     - curl: untuk transfer data
     - screen: untuk menjalankan proses di background
     - sudo: untuk manajemen hak akses

3. `wget -q https://raw.githubusercontent.com/KedaiVPN/easy-vpn-installer/main/install.sh`
   - Mengunduh script installer dari repository
   - Flag `-q` untuk mode quiet (tanpa output progress)

4. `chmod +x install.sh`
   - Memberikan izin eksekusi pada script installer

5. `screen -S install ./install.sh`
   - Menjalankan script di dalam sesi screen bernama "install"
   - Instalasi akan tetap berjalan meskipun koneksi SSH terputus

## Konfigurasi Manual (Opsional)

Jika Anda ingin menyesuaikan pengaturan sebelum instalasi:

1. Unduh file konfigurasi contoh:
```bash
wget -q https://raw.githubusercontent.com/KedaiVPN/easy-vpn-installer/main/config.conf.example -O config.conf
```

2. Edit file konfigurasi sesuai kebutuhan:
```bash
nano config.conf
```

3. Jalankan installer:
```bash
screen -S install ./install.sh
```

## Fitur Keamanan

- Fail2ban untuk proteksi dari serangan brute force
- UFW firewall dengan konfigurasi default yang aman
- Pembersihan log otomatis setiap 3 menit
- Optimasi kernel untuk performa dan keamanan
- Backup konfigurasi otomatis

## Monitoring & Manajemen

- Monitor penggunaan CPU, RAM, dan koneksi
- Log terstruktur di `/var/log/easy-vpn-installer.log`
- Backup konfigurasi di `/root/vpn-backup`

## Troubleshooting

Jika terjadi masalah saat instalasi:

1. Cek log instalasi:
```bash
tail -f /var/log/easy-vpn-installer.log
```

2. Untuk melihat sesi screen yang berjalan:
```bash
screen -ls
```

3. Untuk kembali ke sesi instalasi:
```bash
screen -r install
```

## Lisensi

MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan.

## Kontribusi

Kontribusi sangat diterima! Silakan buat pull request atau laporkan issue jika menemukan bug.

