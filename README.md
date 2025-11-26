# LibaraNHS - NHS Job Application Automation

![LibaraNHS Logo](https://img.shields.io/badge/LibaraNHS-v1.0.0-84cc16)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/license-MIT-blue)

**LibaraNHS** is a full-stack web application that automates job applications to NHS Scotland and NHS England portals. Built with Node.js, Express, EJS, and Tailwind CSS, it streamlines the repetitive task of applying to multiple NHS positions by using Puppeteer for browser automation and Google Gemini AI for cover letter generation.

---

## 🌟 Features

- **Automated Job Applications**: Apply to NHS Scotland and NHS England positions automatically
- **AI-Powered Cover Letters**: Generate professional cover letters using Google Gemini API
- **Resume Management**: Upload, manage, and set default resumes
- **Application Configuration**: Create multiple job search configurations with custom preferences
- **Subscription Plans**: Free, Pro, and Max tiers with varying application limits
- **Secure Credential Storage**: AES-256-GCM encryption for NHS portal credentials
- **Email Notifications**: Get notified about application submissions and status
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dashboard Analytics**: Track application success rates and statistics

---

## 🛠️ Technology Stack

### Backend
- **Node.js** (v18+) - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **Puppeteer** - Browser automation
- **bcrypt** - Password hashing
- **Nodemailer** - Email service

### Frontend
- **EJS** - Templating engine
- **Tailwind CSS** - Utility-first CSS framework
- **Vanilla JavaScript** - Client-side interactivity

### APIs & Services
- **Google Gemini API** - AI cover letter generation
- **SMTP** - Email notifications

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MySQL** (v8.0 or higher)
- **Docker** (optional, for containerized deployment)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/libara-nhs.git
cd libara-nhs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and configure your settings:

```env
# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=libaranhs
DB_PASSWORD=your_secure_password
DB_NAME=libaranhs

# Session
SESSION_SECRET=your_very_long_random_session_secret

# Encryption (32 characters)
ENCRYPTION_KEY=your_32_character_encryption_key

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@libaranhs.com
```

### 4. Database Setup

Create the MySQL database and import the schema:

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE libaranhs;"

# Import schema
mysql -u root -p libaranhs < database/schema.sql

# (Optional) Import sample data
mysql -u root -p libaranhs < database/seed.sql
```

### 5. Build Tailwind CSS

```bash
npm run build:css
```

### 6. Start the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The application will be available at http://localhost:3000

---

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

---

## 📁 Project Structure

```
libaranhs/
├── src/
│   ├── app.js                 # Main application entry
│   ├── config/                # Configuration files
│   ├── middleware/            # Express middleware
│   ├── models/                # Database models
│   ├── controllers/           # Route controllers
│   ├── routes/                # Express routes
│   ├── services/              # Business logic
│   ├── views/                 # EJS templates
│   └── public/                # Static assets
├── database/                  # Database files
├── scripts/                   # Utility scripts
└── docker-compose.yml
```

---

## 🔐 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **Credential Encryption**: AES-256-GCM for NHS credentials
- **Session Security**: HTTP-only cookies, secure flag in production
- **Input Validation**: Server-side validation using express-validator
- **Rate Limiting**: Protection against brute force attacks
- **Helmet.js**: Security headers

---

## 🤖 Puppeteer Automation

The automation system uses Puppeteer to:

1. Login to NHS portals
2. Search for jobs based on user configurations
3. Fill application forms automatically
4. Upload resumes
5. Submit applications
6. Take screenshots for logging
7. Send email notifications

**Note**: The NHS portal selectors in the automation scripts are templates and need to be updated based on the actual portal structures.

---

## 📝 Todo / Roadmap

- [ ] Update Puppeteer selectors for actual NHS portals
- [ ] Add password reset functionality
- [ ] Implement email verification
- [ ] Integrate payment gateway
- [ ] Add application analytics dashboard
- [ ] Create mobile app

---

## 📄 License

This project is licensed under the MIT License.

---

## ⚠️ Disclaimer

This application is for educational and legitimate job application purposes only. Users are responsible for complying with the terms of service of NHS job portals.

---

**Built with ❤️ for healthcare professionals**
