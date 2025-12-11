# OB/GYN Clinic Booking & Queue Management System - Complete Documentation

## 📋 System Overview

A comprehensive clinic management system with WhatsApp-based booking, queue management, and patient experience optimization specifically designed for OB/GYN clinics.

## 🏗️ Architecture

### Backend (NestJS + TypeScript + PostgreSQL)
- **Framework**: NestJS 10+
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT with Passport
- **Scheduling**: @nestjs/schedule for automated notifications
- **WhatsApp Integration**: WhatsApp Business Cloud API

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS Modules

## 📁 Project Structure

```
obgyn-clinic-system/
├── backend/
│   ├── src/
│   │   ├── entities/          # Database entities
│   │   ├── modules/           # Feature modules
│   │   │   ├── appointments/  # Appointment management
│   │   │   ├── auth/          # Authentication & authorization
│   │   │   ├── notifications/ # Notification service & scheduler
│   │   │   ├── patients/      # Patient management
│   │   │   ├── queue/         # Queue management
│   │   │   ├── visits/        # Visit/consultation records
│   │   │   └── whatsapp/      # WhatsApp integration
│   │   └── config/            # Configuration files
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── dashboards/    # Dashboard components
│   │   │   └── ...            # Other components
│   │   ├── contexts/          # React contexts (Auth)
│   │   ├── services/          # API services
│   │   └── types/             # TypeScript types
│   └── package.json
└── docs/
```

## 🗄️ Database Schema

### Core Entities

#### **patients**
- `id` (UUID, PK)
- `fullName` (VARCHAR)
- `phoneNumber` (VARCHAR, UNIQUE)
- `dateOfBirth` (DATE)
- `firstVisitDate` (DATE)
- `generalNotes` (TEXT)
- `isReturningPatient` (BOOLEAN)
- `whatsappId` (VARCHAR)
- `createdAt`, `updatedAt` (TIMESTAMP)

#### **gyne_profiles** (1:1 with patients)
- `id` (UUID, PK)
- `patientId` (UUID, FK)
- `gravidity` (INTEGER) - G (number of pregnancies)
- `parity` (INTEGER) - P (number of deliveries)
- `abortions` (INTEGER) - A (number of abortions/miscarriages)
- `previousDeliveryTypes` (JSONB) - Array of delivery types
- `lastDeliveryDate` (DATE)
- `previousGynecologicalSurgeries` (TEXT)
- `chronicDiseases` (JSONB) - Array of conditions
- `rhStatus` (VARCHAR)
- `currentFamilyPlanningMethod` (VARCHAR)
- `previousFamilyPlanningMethods` (JSONB)
- `otherRelevantNotes` (TEXT)

#### **pregnancies** (1:N with patients)
- `id` (UUID, PK)
- `patientId` (UUID, FK)
- `lmpDate` (DATE) - Last Menstrual Period
- `eddDate` (DATE) - Estimated Date of Delivery
- `currentGestationWeeks` (INTEGER)
- `highRiskFlag` (BOOLEAN)
- `isCurrent` (BOOLEAN)
- `deliveryDate` (DATE)
- `deliveryType` (VARCHAR)

#### **appointments**
- `id` (UUID, PK)
- `patientId` (UUID, FK)
- `visitType` (ENUM) - See VisitType enum
- `appointmentDate` (DATE)
- `appointmentTime` (TIME)
- `queueNumber` (INTEGER)
- `status` (ENUM) - See AppointmentStatus enum
- `emergencyFlag` (BOOLEAN)
- `source` (ENUM) - whatsapp, walk_in, phone, other
- `notes` (TEXT)
- `bookingData` (JSONB) - WhatsApp conversation data
- `createdAt`, `updatedAt` (TIMESTAMP)

#### **visits** (1:1 with appointments)
- `id` (UUID, PK)
- `appointmentId` (UUID, FK, UNIQUE)
- `chiefComplaint` (TEXT)
- `subjectiveNotes` (TEXT)
- `examinationSummary` (TEXT)
- `investigations` (JSONB) - Array of ordered tests
- `diagnosisSummary` (TEXT)
- `treatmentPlan` (TEXT)
- `prescribedMedications` (JSONB)
- `nextVisitRecommendation` (TEXT)

#### **notification_logs**
- `id` (UUID, PK)
- `patientId` (UUID, FK)
- `appointmentId` (UUID, FK, nullable)
- `notificationType` (ENUM) - See NotificationType enum
- `channel` (ENUM) - whatsapp, sms, email
- `messageTemplateKey` (VARCHAR)
- `messageContent` (TEXT)
- `status` (ENUM) - pending, sent, failed
- `sentAt` (TIMESTAMP)
- `errorMessage` (TEXT)
- `createdAt` (TIMESTAMP)

#### **users**
- `id` (UUID, PK)
- `username` (VARCHAR, UNIQUE)
- `email` (VARCHAR)
- `password` (VARCHAR) - Hashed
- `fullName` (VARCHAR)
- `role` (ENUM) - admin, reception, doctor
- `isActive` (BOOLEAN)
- `createdAt`, `updatedAt` (TIMESTAMP)

## 🔄 WhatsApp Flow

### Main Menu
1. Book Pregnancy Visit (First visit / Follow-up)
2. Book Pregnancy Ultrasound / Vaginal Ultrasound
3. Postpartum Follow-up (Normal / C-section)
4. Family Planning (IUD / Pills / Injection / Implant)
5. Infertility / Trying to Conceive
6. General Gynecology Issues
7. Pap Smear / Cervical Screening
8. Emergency Case
9. Modify / Cancel Appointment
10. Check My Queue Number

### Booking Flow Example (Pregnancy Follow-up)
1. Patient selects option 1 → System asks: "First visit or Follow-up?"
2. Patient responds → System asks for name
3. Patient provides name → System asks for LMP date
4. Patient provides LMP → System asks about previous pregnancies
5. Patient responds → System asks about current symptoms
6. System shows available dates → Patient selects date
7. System shows available time slots → Patient selects time
8. System shows confirmation → Patient confirms
9. Appointment created → Booking confirmation sent via WhatsApp

### Emergency Flow
1. Patient selects option 8 → System shows emergency symptoms list
2. Patient selects symptom → System asks when it started
3. Patient responds → System asks if pregnant
4. If pregnant → System asks weeks of pregnancy
5. System marks as emergency → Provides instructions
6. Emergency appointment created with priority in queue

## 🔔 Notification System

### Automated Notifications

1. **Booking Confirmation** - Sent immediately after appointment creation
2. **24-Hour Reminder** - Sent 24 hours before appointment
3. **1-Hour Reminder** - Sent 1 hour before appointment
4. **30-Minute Reminder** - Sent 30 minutes before appointment
5. **Queue Update** - Sent when patient's turn is approaching
6. **Thank You Message** - Sent after consultation with feedback request
7. **Pregnancy Milestones** - Reminders at key pregnancy stages (12 weeks, 20-22 weeks, 28 weeks)

### Scheduling
- Uses `@nestjs/schedule` with cron jobs
- Runs every hour for 24h reminders
- Runs every 15 minutes for 1h reminders
- Runs every 5 minutes for 30m reminders
- Runs daily at 9 AM for pregnancy milestone checks

## 🖥️ Frontend Dashboards

### 1. Reception Dashboard (`/dashboard/reception`)
**Features:**
- View today's appointments in a table
- See queue numbers, patient names, visit types, statuses
- Mark patients as arrived
- Mark appointments as emergency
- Update appointment status
- Add walk-in patients
- Filter by status

**Access:** Reception and Admin roles

### 2. Doctor Dashboard (`/dashboard/doctor`)
**Features:**
- View queue of patients waiting
- Start consultation by clicking on a patient
- View patient information (G-P-A, current pregnancy, etc.)
- Fill visit form with:
  - Chief complaint
  - Subjective notes
  - Examination summary
  - Investigations ordered
  - Diagnosis
  - Treatment plan
  - Next visit recommendation
- Finish consultation (saves visit record)
- Next patient button

**Access:** Doctor and Admin roles

### 3. Waiting Room Display (`/dashboard/waiting-room`)
**Features:**
- Large display showing:
  - Currently seeing patient number
  - Next patient number
  - Anonymized patient names (e.g., "Ms. M. Ahmed")
- Auto-refreshes every 5 seconds
- Minimal information for privacy

**Access:** All authenticated users

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Roles: `admin`, `reception`, `doctor`
- Protected routes with role checking
- Token stored in localStorage (frontend)

## 📡 API Endpoints

### Authentication
- `POST /auth/login` - Login
- `POST /auth/register` - Register new user (admin only)
- `GET /auth/profile` - Get current user profile

### Patients
- `GET /patients` - Get all patients
- `GET /patients/:id` - Get patient by ID
- `GET /patients/phone/:phoneNumber` - Get patient by phone
- `POST /patients` - Create patient
- `PATCH /patients/:id` - Update patient
- `POST /patients/:id/gyne-profile` - Create/update gyne profile
- `POST /patients/:id/pregnancies` - Create pregnancy record

### Appointments
- `GET /appointments` - Get all appointments (optional date filter)
- `GET /appointments/today` - Get today's appointments
- `GET /appointments/:id` - Get appointment by ID
- `POST /appointments` - Create appointment
- `PATCH /appointments/:id` - Update appointment
- `PATCH /appointments/:id/status` - Update appointment status
- `PATCH /appointments/:id/cancel` - Cancel appointment
- `GET /appointments/available-slots` - Get available time slots for a date
- `GET /appointments/available-dates` - Get available dates

### Queue
- `GET /queue/today` - Get today's queue
- `GET /queue/current` - Get current patient being seen
- `GET /queue/next` - Get next patient in queue
- `GET /queue/position/:patientId` - Get patient's queue position
- `GET /queue/waiting-room` - Get waiting room display data
- `PATCH /queue/:id/arrived` - Mark patient as arrived
- `PATCH /queue/:id/start` - Start consultation
- `PATCH /queue/:id/finish` - Finish consultation
- `PATCH /queue/:id/reorder` - Reorder queue

### Visits
- `POST /visits` - Create visit record
- `GET /visits/appointment/:appointmentId` - Get visit by appointment
- `GET /visits/patient/:patientId` - Get all visits for patient
- `GET /visits/:id` - Get visit by ID
- `PATCH /visits/:id` - Update visit record

### Notifications
- `POST /notifications/booking-confirmation/:appointmentId` - Send booking confirmation
- `POST /notifications/queue-update/:appointmentId` - Send queue update
- `POST /notifications/thank-you/:appointmentId` - Send thank you message
- `GET /notifications/history/:patientId` - Get notification history

### WhatsApp
- `POST /whatsapp/webhook` - Receive WhatsApp messages
- `GET /whatsapp/webhook` - Verify webhook (for Meta)

## 🔒 Privacy & Security Features

1. **Minimal Data in Notifications**: Generic messages that don't reveal sensitive medical information
2. **Anonymized Display**: Waiting room shows partial names (e.g., "Ms. M. Ahmed")
3. **Role-Based Access**: Different dashboards for different roles
4. **Password Hashing**: bcrypt with salt rounds
5. **JWT Tokens**: Secure token-based authentication
6. **Database Encryption**: Ready for field-level encryption (can be added)

## 🚀 Getting Started

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure .env with your database and WhatsApp credentials
npm run start:dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL to backend URL
npm start
```

### Database Setup
1. Create PostgreSQL database
2. TypeORM will auto-create tables in development mode
3. Or run migrations in production

### WhatsApp Setup

For detailed step-by-step instructions, see: **[WHATSAPP_SETUP_GUIDE.md](../docs/WHATSAPP_SETUP_GUIDE.md)**

**Quick Summary:**
1. Create Meta Business Account and App
2. Add WhatsApp product to your app
3. Get Phone Number ID and Access Token
4. Configure webhook URL: `https://your-domain.com/whatsapp/webhook`
5. Set verify token in .env
6. Subscribe to webhook events
7. For production: Complete App Review process

**Required Environment Variables:**
```env
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_VERIFY_TOKEN=your-verify-token
```

**For Local Development:**
- Use ngrok or localtunnel to create public URL
- Use temporary test number from Meta (valid 72 hours)
- Temporary access token works for testing

## 📝 Future Enhancements

1. **Video Consultations**: Integration with video calling APIs
2. **Analytics Dashboard**: Reports on appointments, visits, patient statistics
3. **Educational Broadcasts**: Send educational messages to pregnant patients
4. **Multi-language Support**: Support for multiple languages in WhatsApp
5. **SMS Fallback**: SMS notifications when WhatsApp unavailable
6. **Appointment Rescheduling**: Allow patients to reschedule via WhatsApp
7. **Payment Integration**: Handle consultation fees
8. **Lab Results Integration**: Receive and share lab results
9. **Prescription Management**: Digital prescription system
10. **Patient Portal**: Web portal for patients to view their records

## 🛠️ Technology Stack Summary

**Backend:**
- NestJS 10+
- TypeORM 0.3+
- PostgreSQL
- JWT + Passport
- date-fns
- Axios

**Frontend:**
- React 18
- TypeScript
- React Router v6
- Axios
- date-fns

## 📄 License

MIT

