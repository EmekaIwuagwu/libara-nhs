# LibaraNHS - Digital Ocean Deployment Guide

This guide will walk you through deploying LibaraNHS on a Digital Ocean droplet from scratch.

---

## 📋 Prerequisites

- Digital Ocean account
- Domain name (optional, but recommended)
- SSH client installed on your local machine

---

## 🚀 Step 1: Create a Digital Ocean Droplet

1. **Log in to Digital Ocean** and click "Create" → "Droplets"

2. **Choose an image**:
   - Select **Ubuntu 22.04 LTS** (recommended)

3. **Choose a plan**:
   - **Basic Plan**: $12/month (2GB RAM, 1 vCPU) - Minimum recommended
   - **Basic Plan**: $24/month (4GB RAM, 2 vCPU) - Better for production

4. **Choose a datacenter region**:
   - Select the region closest to your users (e.g., London for UK users)

5. **Authentication**:
   - Choose **SSH keys** (recommended) or **Password**
   - If using SSH keys, add your public key

6. **Finalize and create**:
   - Give your droplet a hostname (e.g., `libaranhs-app`)
   - Click **Create Droplet**

7. **Note your droplet's IP address** (shown after creation)

---

## 🔧 Step 2: Connect to Your Droplet

```bash
# SSH into your droplet (replace with your IP)
ssh root@your_droplet_ip

# If using SSH key
ssh -i /path/to/your/private_key root@your_droplet_ip
```

---

## 📦 Step 3: Initial Server Setup

### Update System Packages

```bash
# Update package list
apt update

# Upgrade installed packages
apt upgrade -y
```

### Create a New User (Optional but Recommended)

```bash
# Create a new user
adduser libaranhs

# Add user to sudo group
usermod -aG sudo libaranhs

# Switch to new user
su - libaranhs
```

---

## 🛠️ Step 4: Install Required Software

### Install Node.js (v18.x)

```bash
# Install Node.js repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x
npm --version   # Should show v9.x or higher
```

### Install MySQL

```bash
# Install MySQL server
sudo apt install -y mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
sudo mysql_secure_installation
```

**MySQL Secure Installation Prompts:**
- Set root password: **Yes** (choose a strong password)
- Remove anonymous users: **Yes**
- Disallow root login remotely: **Yes**
- Remove test database: **Yes**
- Reload privilege tables: **Yes**

### Install Nginx (Web Server)

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2
```

### Install Git

```bash
# Install Git
sudo apt install -y git
```

---

## 📥 Step 5: Clone the Repository

```bash
# Navigate to home directory
cd ~

# Clone the repository
git clone https://github.com/EmekaIwuagwu/libara-nhs.git

# Navigate into project directory
cd libara-nhs

# Checkout the correct branch
git checkout claude/libara-nhs-fullstack-0155PERuKx5Mtaknd4yS7ozm
```

---

## ⚙️ Step 6: Install Application Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Tailwind CSS build dependencies
npm install -D tailwindcss autoprefixer postcss
```

---

## 🗄️ Step 7: Set Up MySQL Database

### Create Database and User

```bash
# Login to MySQL as root
sudo mysql -u root -p
```

**In MySQL prompt, run:**

```sql
-- Create database
CREATE DATABASE libaranhs;

-- Create user (replace 'your_password' with a strong password)
CREATE USER 'libaranhs'@'localhost' IDENTIFIED BY 'your_strong_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON libaranhs.* TO 'libaranhs'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### Import Database Schema

```bash
# Import schema
mysql -u libaranhs -p libaranhs < database/schema.sql

# (Optional) Import sample data
mysql -u libaranhs -p libaranhs < database/seed.sql
```

---

## 🔐 Step 8: Configure Environment Variables

### Create .env File

```bash
# Copy example environment file
cp .env.example .env

# Edit environment file
nano .env
```

### Configure Your .env File

```env
# Application
NODE_ENV=production
PORT=3000
APP_URL=http://your_domain.com  # Or http://your_droplet_ip

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=libaranhs
DB_PASSWORD=your_strong_password_here
DB_NAME=libaranhs

# Session Secret (generate a random 64-character string)
SESSION_SECRET=generate_a_very_long_random_string_here_at_least_64_characters

# Encryption Key (must be exactly 32 characters)
ENCRYPTION_KEY=your_32_character_key_here_xxx

# Gemini API (get from https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
EMAIL_FROM=noreply@yourdomain.com

# File Upload
MAX_FILE_SIZE=5242880

# Puppeteer
PUPPETEER_HEADLESS=true
PUPPETEER_TIMEOUT=30000
```

**Save and exit:** `Ctrl + X`, then `Y`, then `Enter`

### Generate Secrets

```bash
# Generate SESSION_SECRET (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate ENCRYPTION_KEY (32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## 🏗️ Step 9: Build the Application

```bash
# Build Tailwind CSS
npm run build:css

# Create uploads directory with proper permissions
mkdir -p src/public/uploads
chmod 755 src/public/uploads
```

---

## 🚀 Step 10: Start Application with PM2

```bash
# Start the application with PM2
pm2 start src/app.js --name libaranhs

# Save PM2 process list
pm2 save

# Set PM2 to start on system boot
pm2 startup

# Copy and run the command that PM2 outputs
```

### Useful PM2 Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs libaranhs

# Restart application
pm2 restart libaranhs

# Stop application
pm2 stop libaranhs

# Monitor
pm2 monit
```

---

## 🌐 Step 11: Configure Nginx as Reverse Proxy

### Create Nginx Configuration

```bash
# Create Nginx configuration file
sudo nano /etc/nginx/sites-available/libaranhs
```

### Add This Configuration

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;  # Replace with your domain or IP

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Client max body size (for file uploads)
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /css {
        alias /home/libaranhs/libara-nhs/src/public/css;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /js {
        alias /home/libaranhs/libara-nhs/src/public/js;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /images {
        alias /home/libaranhs/libara-nhs/src/public/images;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Save and exit:** `Ctrl + X`, then `Y`, then `Enter`

### Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/libaranhs /etc/nginx/sites-enabled/

# Remove default Nginx site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 Step 12: Set Up SSL with Let's Encrypt (Optional but Recommended)

### Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain SSL Certificate

```bash
# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```

**Follow the prompts:**
- Enter your email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### Auto-Renewal

Certbot automatically sets up a cron job for renewal. Test it:

```bash
# Test renewal
sudo certbot renew --dry-run
```

---

## 🔥 Step 13: Configure Firewall

```bash
# Allow OpenSSH
sudo ufw allow OpenSSH

# Allow HTTP
sudo ufw allow 'Nginx HTTP'

# Allow HTTPS
sudo ufw allow 'Nginx HTTPS'

# Enable firewall
sudo ufw enable

# Check firewall status
sudo ufw status
```

---

## 📊 Step 14: Verify Deployment

### Check Application Status

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs libaranhs --lines 50

# Check Nginx status
sudo systemctl status nginx

# Check MySQL status
sudo systemctl status mysql
```

### Test the Application

1. **Open your browser** and navigate to:
   - `http://your_domain.com` (or `http://your_droplet_ip`)
   - If SSL is configured: `https://your_domain.com`

2. **Test functionality**:
   - Visit the home page
   - Try registering a new account
   - Login to the dashboard
   - Test file uploads

---

## 🔧 Step 15: Optional Optimizations

### Set Up Swap Space (for 2GB droplets)

```bash
# Create swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Enable Gzip Compression in Nginx

```bash
# Edit Nginx config
sudo nano /etc/nginx/nginx.conf
```

Add inside `http` block:

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```

---

## 📝 Step 16: Regular Maintenance

### Update Application

```bash
# Navigate to project directory
cd ~/libara-nhs

# Pull latest changes
git pull origin claude/libara-nhs-fullstack-0155PERuKx5Mtaknd4yS7ozm

# Install new dependencies (if any)
npm install

# Rebuild CSS (if changed)
npm run build:css

# Restart application
pm2 restart libaranhs
```

### Monitor Logs

```bash
# Real-time logs
pm2 logs libaranhs

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### Backup Database

```bash
# Create backup directory
mkdir -p ~/backups

# Backup database
mysqldump -u libaranhs -p libaranhs > ~/backups/libaranhs_$(date +%Y%m%d_%H%M%S).sql

# Optional: Set up automated daily backups with cron
crontab -e

# Add this line (backup at 2 AM daily)
0 2 * * * mysqldump -u libaranhs -p'your_password' libaranhs > ~/backups/libaranhs_$(date +\%Y\%m\%d).sql
```

---

## 🐛 Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs libaranhs

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart the application
pm2 restart libaranhs
```

### Database Connection Issues

```bash
# Test database connection
mysql -u libaranhs -p libaranhs

# Check MySQL service
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql
```

### Nginx Issues

```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### Can't Access Application

```bash
# Check firewall rules
sudo ufw status

# Check if application is running
pm2 status

# Check Nginx is running
sudo systemctl status nginx

# Test application directly
curl http://localhost:3000
```

---

## 📞 Support

If you encounter issues:

1. Check the application logs: `pm2 logs libaranhs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify all services are running: `pm2 status`, `sudo systemctl status nginx mysql`
4. Review the troubleshooting section above

---

## 🎉 Congratulations!

Your LibaraNHS application is now deployed on Digital Ocean and accessible to the world!

**Next Steps:**
1. Configure your DNS to point to your droplet IP
2. Set up monitoring and alerts
3. Configure automated backups
4. Update NHS portal credentials in the dashboard
5. Test the automation features

---

## 📋 Quick Reference

### Important Directories
- **Application**: `~/libara-nhs`
- **Logs**: `~/.pm2/logs/`
- **Nginx Config**: `/etc/nginx/sites-available/libaranhs`
- **Uploads**: `~/libara-nhs/src/public/uploads`

### Important Commands
```bash
# Restart everything
pm2 restart libaranhs && sudo systemctl reload nginx

# View all logs
pm2 logs libaranhs

# Check system resources
htop

# Database backup
mysqldump -u libaranhs -p libaranhs > backup.sql
```

---

**Happy Deploying! 🚀**
