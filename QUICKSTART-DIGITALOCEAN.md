# LibaraNHS - Digital Ocean Quick Start

**⚡ Fast deployment guide for experienced users**

---

## 1️⃣ Create Droplet

- **OS**: Ubuntu 22.04 LTS
- **Plan**: 2GB RAM minimum ($12/mo)
- **Region**: Closest to your users
- **SSH**: Add your SSH key

---

## 2️⃣ Initial Setup

```bash
# SSH into droplet
ssh root@your_droplet_ip

# Update system
apt update && apt upgrade -y

# Install everything
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs mysql-server nginx git
npm install -g pm2
```

---

## 3️⃣ MySQL Setup

```bash
# Secure MySQL
mysql_secure_installation

# Create database
mysql -u root -p << EOF
CREATE DATABASE libaranhs;
CREATE USER 'libaranhs'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD';
GRANT ALL PRIVILEGES ON libaranhs.* TO 'libaranhs'@'localhost';
FLUSH PRIVILEGES;
EOF
```

---

## 4️⃣ Clone & Configure

```bash
# Clone repository
cd ~
git clone https://github.com/EmekaIwuagwu/libara-nhs.git
cd libara-nhs
git checkout claude/libara-nhs-fullstack-0155PERuKx5Mtaknd4yS7ozm

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Edit with your settings

# Import database
mysql -u libaranhs -p libaranhs < database/schema.sql

# Build CSS
npm run build:css
```

---

## 5️⃣ Generate Secrets

```bash
# Session secret (64 chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption key (32 chars)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

Update `.env` with generated secrets.

---

## 6️⃣ Start Application

```bash
# Start with PM2
pm2 start src/app.js --name libaranhs
pm2 save
pm2 startup  # Run the command it outputs
```

---

## 7️⃣ Configure Nginx

```bash
# Create config
cat > /etc/nginx/sites-available/libaranhs << 'EOF'
server {
    listen 80;
    server_name your_domain.com;
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/libaranhs /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## 8️⃣ SSL (Optional)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d your_domain.com
```

---

## 9️⃣ Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## ✅ Done!

Visit: `http://your_domain.com` or `http://your_droplet_ip`

---

## 🔧 Useful Commands

```bash
# Check status
pm2 status
pm2 logs libaranhs

# Restart
pm2 restart libaranhs

# Update app
cd ~/libara-nhs
git pull
npm install
npm run build:css
pm2 restart libaranhs

# Backup database
mysqldump -u libaranhs -p libaranhs > backup.sql
```

---

## 📚 Full Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

**🚀 Happy Deploying!**
