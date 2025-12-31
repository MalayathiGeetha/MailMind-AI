# MailMind-AI 🚀

[![Status](https://img.shields.io/badge/status-production-green.svg)](https://github.com/yourusername/MailMind-AI)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-orange.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org)

**AI-Powered Email Assistant** - Generate, analyze, send, & track professional emails with multi-AI support (Gemini ⚡ + Ollama 🆓 + Local Fallback 🔒)

> **Built by full-stack developer from Narnaund, Haryana** - Production-ready SaaS with 13 AI features!

## ✨ **Why MailMind-AI?** 🎯

**Problem:** Writing professional emails takes time + context-switching  
**Solution:** AI generates, analyzes, sends → **Inbox Zero in seconds!**


## ✨ **13 Production-Ready Features**

| # | Feature | Status | AI-Powered |
|---|---------|--------|------------|
| 1 | **Email Generation** | ✅ Live | Gemini/Ollama |
| 2 | **User Dashboard** | ✅ Live | Real-time stats |
| 3 | **Send Real Emails** | ✅ Live | Gmail/Spring Mail |
| 4 | **Intent Detection** | ✅ Live | Classifies 8 intents |
| 5 | **AI Model Switcher** | ✅ Live | Gemini ↔ Ollama ↔ Local |
| 6 | **Email History** | ✅ Live | Intent filtering |
| 7 | **Analytics** | ✅ Live | Tone/Intent charts |
| 8 | **Subject Generator** | ✅ Live | Click-worthy subjects |
| 9 | **Email Summarizer** | ✅ Live | Key points + deadlines |
| 10 | **Thread Reply** | ✅ Live | Context-aware |
| 11 | **Follow-up Generator** | ✅ Live | Polite reminders |
| 12 | **Safety Check** | ✅ Live | Risk analysis |
| 13 | **Advanced Mode** | ✅ Live | Fine-tune prompts |

## 🎯 **Live Demo**
```bash
Frontend: http://localhost:5173
Backend: http://localhost:8081
JWT Auth → Full access to ALL features!
```

## 🛠 **Tech Stack**
```bash
Frontend: React 18 + Vite + TypeScript + shadcn/ui + Tailwind + Lucide
Backend: Spring Boot 3.x + MySQL + JWT + Maven
AI: Google Gemini 1.5 + Ollama (local) + Fallback
Email: Spring Mail (Gmail) + SendGrid ready
Database: MySQL + JPA/Hibernate
Security: Spring Security + JWT
```



## 🚀 **Quick Start**

### 1. **Backend** 
```bash
# Clone & Backend
mvn clean install
cp application-local.yml application.yml  # Gmail creds
mvn spring-boot:run
# http://localhost:8081 → Backend LIVE!

```
### 2. **Frontend** 
```bash
npm install
npm run dev
# http://localhost:5173
```

### **Project Structure**

MailMind-AI/
├── frontend/                 # React + Vite + shadcn
│   ├── src/pages/
│   │   ├── UserDashboard.tsx  # Stats + AI Switcher
│   │   ├── SendEmail.tsx      # Real email sending
│   │   ├── IntentDetector.tsx # 8-intent classifier
│   │   └── History.tsx        # Intent-filtered list
            '
            '
            '
│   └── src/lib/apiClient.ts   # All 13 endpoints
├── backend/                  # Spring Boot + MySQL
│   ├── src/main/java/com/email/
│   │   ├── controller/        # 13+ REST endpoints
│   │   ├── service/           # AI + Email logic
│   │   ├── entity/            # User + EmailHistory
│   │   └── dto/               # Request/Response
└── README.md


### **🎮 Feature Deep Dive**
**1. AI Model Switcher ⭐**

[Gemini 1.5 ⚡]  [Ollama 🆓*]  [Local Fallback 🔒]
         ✓ Active: Gemini
Live toggle between cloud/local AI

Zero downtime - intelligent fallbacks

Real-time dashboard reflects changes

**2. Intent Detection 🧠**

"Help, login broken!" → SUPPORT_REQUEST (98%)
"Why this intent? → "bugs, issues & help requests"
8 precise categories: COMPLAINT, JOB_APPLICATION, etc.

Gemini-powered with local fallback

Frontend + Backend sync perfectly

**3. User Dashboard 📊**

Total Emails: 47     Words: 12,342    Avg: 263 chars
Recent: "Follow-up on Q4..." (Ollama)
Active Model: Gemini 🆓
Real-time email stats + recent activity

AI model status + quick switcher

Usage insights + upgrade prompts

**4. Real Email Sending 📧**

To: john@company.com | Subject: Project Update
"Hi John, quick update on deliverables..."
✓ Sent via Gmail → Real inbox!
Production Gmail integration

Real inbox delivery receipts

Professional email templates

**🔐 Security & Auth**
JWT Tokens - Secure all endpoints

Spring Security - Role-based access

HTTPS Ready - Production secure

**🧪 API Endpoints (13+)**
```bash
GET  /api/user/dashboard          # Stats + provider
PUT  /api/user/ai-provider        # Switch Gemini/Ollama
POST /api/email/generate          # AI email
POST /api/email/send-email        # Real delivery
GET  /api/history/intent/FOLLOWUP # Filtered history
GET  /api/analytics               # Tone charts
```

**📈 Production Ready**

✅ Responsive design (Mobile → Desktop)
✅ Loading states + Error handling
✅ Toast notifications
✅ Real-time updates
✅ Database persistence
✅ Multi-AI redundancy
✅ Email delivery receipts
✅ Analytics dashboards

**🤝 Contributing**
```bash
1. Fork → Clone → Create branch
2. Backend: mvn clean compile
3. Frontend: npm run dev
4. Test all 13 features
5. PR with screenshots!
```

