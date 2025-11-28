# LibaraNHS Automation Module - Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- ✅ Node.js 18+ installed
- ✅ MySQL 8.0+ database access
- ✅ SMTP server configured for email notifications
- ✅ Git repository access
- ✅ Server with sufficient resources (2GB+ RAM recommended for browser automation)

## Step-by-Step Deployment

### 1. Pull Latest Code

```bash
# Pull the latest changes
git checkout claude/libara-nhs-automation-01L5zPJ3upFtpq3dBMs1f9v6
git pull origin claude/libara-nhs-automation-01L5zPJ3upFtpq3dBMs1f9v6

# Or merge to main if you've approved the PR
git checkout main
git merge claude/libara-nhs-automation-01L5zPJ3upFtpq3dBMs1f9v6
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# The package.json now includes:
# - playwright@^1.40.0 (for automation infrastructure)
# - puppeteer@^21.6.1 (already installed, used for browser automation)
```

### 3. Install Browser Dependencies

Since we're using Puppeteer for automation, you need to ensure Chromium is installed:

#### Option A: Let Puppeteer download Chromium (Recommended for development)
```bash
# This should have happened during npm install
# If not, you can manually trigger it:
node node_modules/puppeteer/install.mjs
```

#### Option B: Use system Chrome/Chromium (Recommended for production)
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y chromium-browser

# CentOS/RHEL
sudo yum install -y chromium

# macOS
brew install --cask chromium
```

#### Option C: Install required dependencies for headless Chrome
```bash
# Ubuntu/Debian - Install dependencies for running Chromium
sudo apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils
```

### 4. Database Migration

Run the text_resumes table migration:

```bash
# Method 1: Using MySQL command line
mysql -u your_username -p your_database_name < database/migrations/add_text_resumes.sql

# Method 2: Using .env variables
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < database/migrations/add_text_resumes.sql

# Method 3: Direct MySQL execution
mysql -u your_username -p
# Then in MySQL prompt:
USE your_database_name;
SOURCE database/migrations/add_text_resumes.sql;
```

**Verify migration:**
```sql
-- Check if table was created
SHOW TABLES LIKE 'text_resumes';

-- Check table structure
DESCRIBE text_resumes;

-- Should show columns: id, user_id, resume_name, personal_statement, work_experience,
-- education, skills, certifications, references_text, full_cv_text, is_default,
-- created_at, updated_at
```

### 5. Environment Variables

Ensure your `.env` file has all required variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=libaranhs

# Session Secret
SESSION_SECRET=your-very-secure-random-session-secret-here

# Encryption Key (for NHS credentials)
ENCRYPTION_KEY=your-32-character-encryption-key

# Email Configuration (for automation notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=LibaraNHS <noreply@libaranhs.com>

# Application
NODE_ENV=production
PORT=3000

# Cloudinary (for resume file uploads - already configured)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 6. Build CSS (if needed)

```bash
# Build Tailwind CSS
npm run build:css
```

### 7. Test the Application Locally

Before deploying to production, test locally:

```bash
# Start the application in development mode
npm run dev

# Or start in production mode
npm start
```

**Test Checklist:**

1. **Navigate to Text Resume API:**
   ```bash
   # Test getting text resumes (should return empty array initially)
   curl -X GET http://localhost:3000/dashboard/resume/text-resumes \
     -H "Cookie: connect.sid=your_session_cookie"
   ```

2. **Navigate to ApplyBox:**
   - Visit: `http://localhost:3000/dashboard/applybox`
   - Check prerequisites display correctly
   - Verify all three checks (credentials, resume, config)

3. **Create a Test Text Resume:**
   ```bash
   # Via API (you'll need to be logged in)
   curl -X POST http://localhost:3000/dashboard/resume/text-resumes \
     -H "Content-Type: application/json" \
     -H "Cookie: connect.sid=your_session_cookie" \
     -d '{
       "resume_name": "Test Healthcare CV",
       "full_cv_text": "PERSONAL STATEMENT\nDedicated healthcare professional...\n\nWORK EXPERIENCE\nHealthcare Assistant - NHS Trust...",
       "personal_statement": "Dedicated healthcare professional...",
       "work_experience": "Healthcare Assistant - NHS Trust..."
     }'
   ```

4. **Test Automation (Optional - requires real NHS credentials):**
   - Create NHS England credentials in Settings
   - Create an application configuration
   - Try starting automation from ApplyBox
   - Monitor console logs for any errors

### 8. Production Deployment

#### Option A: Traditional Server (PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start src/app.js --name libaranhs

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# Monitor application
pm2 logs libaranhs
pm2 monit
```

**PM2 Configuration File (ecosystem.config.js):**
```javascript
module.exports = {
  apps: [{
    name: 'libaranhs',
    script: './src/app.js',
    instances: 1, // Use 1 for browser automation (resource-intensive)
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Then start with:
```bash
pm2 start ecosystem.config.js
```

#### Option B: Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-bullseye

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build CSS
RUN npm run build:css

# Create screenshots directory
RUN mkdir -p screenshots

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=3306
      - DB_USER=libaranhs
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=libaranhs
      - SESSION_SECRET=${SESSION_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    depends_on:
      - db
    volumes:
      - ./screenshots:/app/screenshots
      - ./logs:/app/logs
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=libaranhs
      - MYSQL_USER=libaranhs
      - MYSQL_PASSWORD=${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/migrations:/docker-entrypoint-initdb.d
    restart: unless-stopped

volumes:
  mysql_data:
```

Deploy with:
```bash
docker-compose up -d
```

#### Option C: Cloud Platform (Heroku, Railway, Render)

**For platforms that don't support Puppeteer out of the box:**

1. Add buildpacks (Heroku example):
```bash
heroku buildpacks:add jontewks/puppeteer
heroku buildpacks:add heroku/nodejs
```

2. Update Procfile:
```
web: npm start
```

3. Set environment variables in dashboard

### 9. Configure Reverse Proxy (Nginx)

**Nginx configuration (`/etc/nginx/sites-available/libaranhs`):**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

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

        # Increase timeouts for automation
        proxy_read_timeout 600s;
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/libaranhs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 10. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal:
sudo certbot renew --dry-run
```

### 11. Configure Firewall

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 12. Setup Logging and Monitoring

**Create logs directory:**
```bash
mkdir -p logs
touch logs/automation.log logs/error.log
```

**Setup log rotation (`/etc/logrotate.d/libaranhs`):**
```
/home/your_user/libara-nhs/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 your_user your_group
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

**Monitor automation:**
```bash
# Watch automation logs in real-time
tail -f logs/automation.log

# Watch PM2 logs
pm2 logs libaranhs --lines 100
```

### 13. Create Screenshots Directory

```bash
# Create directory for automation screenshots
mkdir -p screenshots
chmod 755 screenshots

# Optional: Add to .gitignore if not already there
echo "screenshots/" >> .gitignore
```

### 14. Setup Cron Jobs (Optional)

If you want scheduled automation runs:

```bash
# Edit crontab
crontab -e

# Example: Run automation daily at 2 AM
0 2 * * * /usr/bin/node /path/to/libara-nhs/scripts/scheduled-automation.js >> /path/to/libara-nhs/logs/cron.log 2>&1
```

## Post-Deployment Verification

### 1. Health Check

```bash
# Check if application is running
curl http://localhost:3000

# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs libaranhs --err --lines 50
```

### 2. Database Verification

```sql
-- Verify text_resumes table exists
USE libaranhs;
SHOW TABLES LIKE 'text_resumes';

-- Check table is empty (or has test data)
SELECT COUNT(*) FROM text_resumes;

-- Verify all other tables are intact
SHOW TABLES;
```

### 3. Feature Testing

Test each feature in order:

1. **User Registration/Login** ✅
2. **Dashboard Access** ✅
3. **Create Application Config** ✅
4. **Save NHS Credentials** (Settings page) ✅
5. **Create Text Resume** (via API or future UI) ✅
6. **Access ApplyBox** (`/dashboard/applybox`) ✅
7. **Run Test Automation** (with real NHS credentials) ✅

### 4. Monitor First Automation Run

```bash
# Watch logs during automation
tail -f logs/automation.log

# Check for screenshots (debugging)
ls -lh screenshots/

# Verify applications saved to database
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT * FROM applications ORDER BY created_at DESC LIMIT 5;"
```

## Troubleshooting

### Issue: Puppeteer can't launch browser

**Solution:**
```bash
# Install missing dependencies
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
  libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 \
  libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
  libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
  libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
  fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

# Or specify Chromium path in browser.js:
# executablePath: '/usr/bin/chromium-browser'
```

### Issue: Permission denied on screenshots

**Solution:**
```bash
chmod 755 screenshots
chown -R your_user:your_group screenshots
```

### Issue: Automation times out

**Solution:**
- Increase timeouts in `src/services/automation/constants.js`
- Increase Nginx proxy timeout (shown above)
- Check network connectivity to jobs.nhs.uk

### Issue: Text resumes not appearing

**Solution:**
```bash
# Verify migration ran
mysql -u $DB_USER -p -e "USE $DB_NAME; DESCRIBE text_resumes;"

# Check routes are loaded
grep -r "text-resumes" src/routes/

# Restart application
pm2 restart libaranhs
```

### Issue: Email notifications not sending

**Solution:**
- Verify SMTP settings in `.env`
- Check `src/services/emailService.js` has required methods
- Test email manually:
```bash
node -e "require('./src/services/emailService').sendTestEmail('test@example.com')"
```

## Security Checklist

- ✅ HTTPS enabled with valid SSL certificate
- ✅ Firewall configured (ports 80, 443, 22 only)
- ✅ Environment variables secured (not in code)
- ✅ NHS credentials encrypted in database (AES-256-GCM)
- ✅ Session secret is strong and random
- ✅ Database credentials are secure
- ✅ Screenshots directory permissions set correctly
- ✅ Rate limiting enabled (check existing middleware)
- ✅ CORS configured properly
- ✅ Helmet.js security headers enabled

## Performance Optimization

1. **Enable compression** (already in package.json)
2. **Use PM2 cluster mode** (if not using browser automation)
3. **Setup Redis for sessions** (optional, for scaling)
4. **Enable database connection pooling** (already configured)
5. **Monitor memory usage** during automation runs

## Backup Strategy

```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > backups/db_backup_$DATE.sql
gzip backups/db_backup_$DATE.sql

# Keep only last 30 days
find backups/ -name "db_backup_*.sql.gz" -mtime +30 -delete

# Setup daily backups
crontab -e
# Add: 0 3 * * * /path/to/backup-script.sh
```

## Maintenance

### Weekly Tasks
- Review error logs
- Check disk space (screenshots can accumulate)
- Review successful automation rate

### Monthly Tasks
- Update dependencies: `npm update`
- Review and optimize database
- Check SSL certificate expiry
- Review application performance metrics

## Support

If you encounter issues during deployment:

1. Check logs: `pm2 logs libaranhs`
2. Review implementation summary: `IMPLEMENTATION_SUMMARY.md`
3. Verify all environment variables are set
4. Test browser automation manually
5. Check database migration completed successfully

## Success Criteria

Your deployment is successful when:

✅ Application accessible via HTTPS
✅ Users can login and access dashboard
✅ ApplyBox page loads correctly
✅ Prerequisites check works
✅ Can create text resumes (via API)
✅ Can start automation (with valid credentials)
✅ Automation completes without errors
✅ Email notifications received
✅ Applications saved to database
✅ No errors in PM2 logs

---

**Deployment completed successfully?** 🎉

Your LibaraNHS automation module is now live and ready to help users automate their NHS job applications!
