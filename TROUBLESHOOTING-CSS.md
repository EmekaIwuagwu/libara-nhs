# CSS Not Loading - Troubleshooting Guide

## ✅ Verified Working Locally
The codebase has been tested and confirmed working:
- ✅ CSS file exists: `src/public/css/output.css` (22KB)
- ✅ HTML structure correct with proper `<link>` tag
- ✅ Express static file serving configured correctly
- ✅ Test server successfully serves CSS at http://localhost:3001/css/output.css

## 🔧 Server Deployment Fix

### Step 1: Update Nginx Configuration

Copy the nginx.conf file to your server:

```bash
sudo cp ~/libara-nhs/nginx.conf /etc/nginx/sites-available/libaranhs
sudo systemctl reload nginx
```

### Step 2: Verify Node.js App is Running

```bash
pm2 status
pm2 logs libaranhs --lines 20
```

The app should show status: **online**

### Step 3: Test CSS Loading

#### Test 1: Direct Node.js Access (should work)
```bash
curl -I http://localhost:3000/css/output.css
```
Expected: `HTTP/1.1 200 OK`

#### Test 2: Through Nginx (should also work)
```bash
curl -I http://174.138.65.48/css/output.css
```
Expected: `HTTP/1.1 200 OK`

### Step 4: Hard Refresh Browser
- Chrome/Firefox: `Ctrl + Shift + R`
- Or open in Incognito mode
- Or clear browser cache

### Step 5: Check Browser DevTools
1. Press F12
2. Go to Network tab
3. Refresh page
4. Look for `output.css`
5. Should show: Status **200**, Size **22.3 KB**, Type **stylesheet**

## 🐛 Common Issues

### Issue 1: Connection Refused
**Symptom:** `ERR_CONNECTION_REFUSED` in browser

**Causes:**
- Node.js app not running
- Nginx not running
- Firewall blocking port 80

**Fix:**
```bash
# Check if app is running
pm2 status

# Check if Nginx is running
sudo systemctl status nginx

# Restart both
pm2 restart libaranhs
sudo systemctl restart nginx
```

### Issue 2: 404 Not Found
**Symptom:** CSS request returns 404

**Causes:**
- CSS file doesn't exist on server
- Path mismatch

**Fix:**
```bash
# Verify file exists
ls -lh ~/libara-nhs/src/public/css/output.css

# If missing, pull latest code
cd ~/libara-nhs
git pull origin claude/libara-nhs-fullstack-0155PERuKx5Mtaknd4yS7ozm

# Restart app
pm2 restart libaranhs
```

### Issue 3: 403 Forbidden
**Symptom:** CSS request returns 403

**Causes:**
- File permission issues
- Nginx trying to serve files directly without access

**Fix:**
Let Node.js handle all requests (already configured in nginx.conf)

### Issue 4: Blank Page with No Styles
**Symptom:** Page loads but completely unstyled

**Causes:**
- Browser cache showing old version
- CSS file not linked in HTML

**Fix:**
```bash
# On server - verify HTML has CSS link
head -15 ~/libara-nhs/src/views/public/home.ejs | grep "css"

# Should see: <link rel="stylesheet" href="/css/output.css">

# Hard refresh browser: Ctrl+Shift+R
```

## 📊 Expected Working State

When everything is working correctly:

1. **PM2 Status:**
   ```
   status: online
   restart: 0-5 (low number)
   ```

2. **PM2 Logs show CSS requests:**
   ```
   GET / 200
   GET /css/output.css 200 - 22267
   ```

3. **Browser Network Tab:**
   ```
   output.css    200    22.3 KB    text/css
   ```

4. **Page Appearance:**
   - Lime green (#84cc16) header and hero section
   - White cards with shadows
   - Styled buttons
   - Proper fonts and spacing

## 🚨 If Still Not Working

Run this diagnostic script on your server:

```bash
#!/bin/bash
echo "=== LibaraNHS CSS Diagnostic ==="
echo ""
echo "1. CSS File Check:"
ls -lh ~/libara-nhs/src/public/css/output.css
echo ""
echo "2. PM2 Status:"
pm2 status
echo ""
echo "3. Nginx Status:"
sudo systemctl status nginx --no-pager
echo ""
echo "4. Test Node.js Direct:"
curl -I http://localhost:3000/css/output.css 2>&1 | head -5
echo ""
echo "5. Test Through Nginx:"
curl -I http://174.138.65.48/css/output.css 2>&1 | head -5
echo ""
echo "6. HTML CSS Link:"
head -15 ~/libara-nhs/src/views/public/home.ejs | grep "css"
```

Save as `diagnose.sh`, run with `bash diagnose.sh`, and share the output.

## 📝 File Checklist

Ensure these files exist and have correct content:

- [ ] `src/public/css/output.css` (22KB, minified Tailwind CSS)
- [ ] `src/views/public/home.ejs` (starts with `<!DOCTYPE html>`)
- [ ] `src/views/public/about.ejs` (starts with `<!DOCTYPE html>`)
- [ ] `src/views/public/services.ejs` (starts with `<!DOCTYPE html>`)
- [ ] `src/views/public/contact.ejs` (starts with `<!DOCTYPE html>`)
- [ ] `src/app.js` (has `app.use(express.static(...))` on line 87)
- [ ] `/etc/nginx/sites-enabled/libaranhs` (proxies to localhost:3000)

## 🎯 Quick Fix Command Sequence

Try this complete reset:

```bash
cd ~/libara-nhs
git pull origin claude/libara-nhs-fullstack-0155PERuKx5Mtaknd4yS7ozm
sudo cp nginx.conf /etc/nginx/sites-available/libaranhs
sudo nginx -t && sudo systemctl reload nginx
pm2 restart libaranhs
pm2 logs libaranhs --lines 10
```

Then hard refresh browser (Ctrl+Shift+R).
