# OB/GYN Clinic Booking & Queue Management System

A comprehensive clinic management system with Telegram-based booking, queue management, and patient experience optimization.

## 🏗️ Architecture

- **Backend**: NestJS (Node.js) with TypeScript
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL
- **Messaging Integration**: Telegram Bot API

## 📁 Project Structure

```
obgyn-clinic-system/
├── backend/          # NestJS backend application
├── frontend/         # React frontend application
└── docs/            # Documentation and design docs
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Telegram Bot Token (see [Telegram Setup Guide](docs/TELEGRAM_SETUP_GUIDE.md))

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure .env with your database and Telegram Bot Token (see docs/TELEGRAM_SETUP_GUIDE.md)
npm run migration:run
npm run start:dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Configure API endpoint
npm start
```

## 📋 Features

- ✅ Telegram-based appointment booking
- ✅ Emergency triage system
- ✅ Queue management with real-time updates
- ✅ Automated reminders and notifications
- ✅ Reception, Doctor, and Waiting Room dashboards
- ✅ Patient profiles tailored for OB/GYN
- ✅ Privacy-focused design

## 🔒 Privacy & Security

- Sensitive medical data encrypted at rest
- Minimal information in Telegram notifications
- Anonymized display in waiting room
- Role-based access control

