"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const common_1 = require("@nestjs/common");
const patients_service_1 = require("../patients/patients.service");
const appointments_service_1 = require("../appointments/appointments.service");
const notifications_service_1 = require("../notifications/notifications.service");
const queue_service_1 = require("../queue/queue.service");
const appointment_entity_1 = require("../../entities/appointment.entity");
const date_fns_1 = require("date-fns");
let ConversationService = class ConversationService {
    constructor(patientsService, appointmentsService, notificationsService, queueService) {
        this.patientsService = patientsService;
        this.appointmentsService = appointmentsService;
        this.notificationsService = notificationsService;
        this.queueService = queueService;
        this.conversations = new Map();
        this.SESSION_TIMEOUT = 30 * 60 * 1000;
    }
    async processMessage(chatId, message, username) {
        this.cleanupExpiredSessions();
        const normalizedMessage = message.trim().toLowerCase();
        const state = this.getOrCreateState(chatId);
        if (this.isMenuKeyword(normalizedMessage)) {
            state.step = 'menu';
            state.data = {};
            return this.getMainMenu();
        }
        switch (state.step) {
            case 'menu':
                return await this.handleMenuSelection(chatId, normalizedMessage, state);
            case 'pregnancy_first_visit_name':
            case 'pregnancy_followup_name':
            case 'ultrasound_name':
            case 'postpartum_name':
            case 'family_planning_name':
            case 'infertility_name':
            case 'general_gyne_name':
            case 'pap_smear_name':
                return await this.handleNameInput(chatId, normalizedMessage, state, username);
            case 'pregnancy_first_visit_lmp':
            case 'pregnancy_followup_lmp':
                return await this.handleLMPInput(chatId, normalizedMessage, state);
            case 'pregnancy_first_visit_previous':
                return await this.handlePreviousPregnancy(chatId, normalizedMessage, state);
            case 'pregnancy_followup_symptoms':
                return await this.handlePregnancySymptoms(chatId, normalizedMessage, state);
            case 'family_planning_last_delivery':
                return await this.handleLastDelivery(chatId, normalizedMessage, state);
            case 'family_planning_breastfeeding':
                return await this.handleBreastfeeding(chatId, normalizedMessage, state);
            case 'infertility_duration':
                return await this.handleInfertilityDuration(chatId, normalizedMessage, state);
            case 'emergency_symptom':
                return await this.handleEmergencySymptom(chatId, normalizedMessage, state);
            case 'emergency_when':
                return await this.handleEmergencyWhen(chatId, normalizedMessage, state);
            case 'emergency_pregnant':
                return await this.handleEmergencyPregnant(chatId, normalizedMessage, state);
            case 'select_date':
                return await this.handleDateSelection(chatId, normalizedMessage, state);
            case 'select_time':
                return await this.handleTimeSelection(chatId, normalizedMessage, state);
            case 'confirm_booking':
                return await this.handleBookingConfirmation(chatId, normalizedMessage, state);
            default:
                state.step = 'menu';
                return this.getMainMenu();
        }
    }
    getMainMenu() {
        return `👋 *Welcome to OB/GYN Clinic!*

Please select an option by replying with the number:

1️⃣ Book Pregnancy Visit (First visit / Follow-up)
2️⃣ Book Ultrasound (Pregnancy / Vaginal)
3️⃣ Postpartum Follow-up
4️⃣ Family Planning
5️⃣ Infertility / Trying to Conceive
6️⃣ General Gynecology Issues
7️⃣ Pap Smear / Cervical Screening
8️⃣ Emergency Case
9️⃣ Modify / Cancel Appointment
🔟 Check My Queue Number

*Reply with a number (1-10)*`;
    }
    getOrCreateState(chatId) {
        if (!this.conversations.has(chatId)) {
            this.conversations.set(chatId, {
                chatId,
                step: 'menu',
                data: {},
                lastActivity: new Date(),
            });
        }
        const state = this.conversations.get(chatId);
        state.lastActivity = new Date();
        return state;
    }
    cleanupExpiredSessions() {
        const now = new Date();
        for (const [chatId, state] of this.conversations.entries()) {
            if (now.getTime() - state.lastActivity.getTime() > this.SESSION_TIMEOUT) {
                this.conversations.delete(chatId);
            }
        }
    }
    isMenuKeyword(message) {
        const keywords = ['menu', 'start', 'begin', 'help', 'options', 'main'];
        return keywords.some((keyword) => message.includes(keyword));
    }
    async handleMenuSelection(chatId, message, state) {
        const selection = message.trim();
        switch (selection) {
            case '1':
                state.step = 'pregnancy_first_visit_name';
                return `📋 *Book Pregnancy Visit*

Is this your first pregnancy visit or a follow-up?

1️⃣ First visit
2️⃣ Follow-up

*Reply with 1 or 2*`;
            case '2':
                state.step = 'ultrasound_name';
                state.data.visitType = appointment_entity_1.VisitType.ULTRASOUND;
                return `Please provide your full name:

*Reply with your name*`;
            case '3':
                state.step = 'postpartum_name';
                return `📋 *Postpartum Follow-up*

What type of delivery did you have?

1️⃣ Normal delivery
2️⃣ C-section

*Reply with 1 or 2*`;
            case '4':
                state.step = 'family_planning_name';
                state.data.visitType = appointment_entity_1.VisitType.FAMILY_PLANNING;
                return `Please provide your full name:

*Reply with your name*`;
            case '5':
                state.step = 'infertility_name';
                state.data.visitType = appointment_entity_1.VisitType.INFERTILITY;
                return `Please provide your full name:

*Reply with your name*`;
            case '6':
                state.step = 'general_gyne_name';
                state.data.visitType = appointment_entity_1.VisitType.GENERAL_GYNE;
                return `Please provide your full name:

*Reply with your name*`;
            case '7':
                state.step = 'pap_smear_name';
                state.data.visitType = appointment_entity_1.VisitType.PAP_SMEAR;
                return `Please provide your full name:

*Reply with your name*`;
            case '8':
                state.step = 'emergency_symptom';
                state.data.emergencyFlag = true;
                state.data.visitType = appointment_entity_1.VisitType.EMERGENCY;
                return `🚨 *EMERGENCY CASE*

Please select your main symptom:

1️⃣ Heavy vaginal bleeding
2️⃣ Decreased/absent fetal movement
3️⃣ Sudden severe abdominal/pelvic pain
4️⃣ Leakage of amniotic fluid (water breaking)
5️⃣ Severe pain/infection at C-section wound
6️⃣ High fever + severe headache + visual disturbances
7️⃣ Other urgent symptom

*Reply with the number*`;
            case '9':
                return `To modify or cancel your appointment, please call our clinic directly or reply with your appointment reference number.

For assistance, please contact: [Clinic Phone]`;
            case '10':
                const patient = await this.findPatientByChatId(chatId);
                if (!patient) {
                    return `We couldn't find your information. Please book an appointment first.`;
                }
                const today = (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd');
                const todayAppointments = await this.appointmentsService.findByDate(today);
                const todayAppointment = todayAppointments.find((apt) => apt.patientId === patient.id &&
                    apt.status !== appointment_entity_1.AppointmentStatus.CANCELLED &&
                    apt.status !== appointment_entity_1.AppointmentStatus.FINISHED &&
                    apt.status !== appointment_entity_1.AppointmentStatus.NO_SHOW);
                if (!todayAppointment) {
                    return `You don't have an appointment scheduled for today. 

To book an appointment, please reply with the number from the main menu.`;
                }
                const queuePosition = await this.queueService.getQueuePosition(patient.id);
                const estimatedWaitTime = queuePosition
                    ? await this.queueService.getEstimatedWaitTime(queuePosition)
                    : null;
                let statusMessage = '';
                switch (todayAppointment.status) {
                    case appointment_entity_1.AppointmentStatus.WITH_DOCTOR:
                        statusMessage = '✅ You are currently with the doctor.';
                        break;
                    case appointment_entity_1.AppointmentStatus.ARRIVED:
                        statusMessage = `🟢 You have arrived. Queue position: ${queuePosition || 'N/A'}`;
                        if (estimatedWaitTime !== null && queuePosition) {
                            statusMessage += `\n⏱️ Estimated wait time: ${estimatedWaitTime} minutes`;
                        }
                        break;
                    case appointment_entity_1.AppointmentStatus.CONFIRMED:
                    case appointment_entity_1.AppointmentStatus.BOOKED:
                        statusMessage = `📋 Your appointment is confirmed.\n`;
                        statusMessage += `⏰ Time: ${todayAppointment.appointmentTime}\n`;
                        statusMessage += `📝 Queue Number: ${todayAppointment.queueNumber || 'To be assigned'}`;
                        if (queuePosition) {
                            statusMessage += `\n📍 Current position in queue: ${queuePosition}`;
                            if (estimatedWaitTime !== null) {
                                statusMessage += `\n⏱️ Estimated wait time: ${estimatedWaitTime} minutes`;
                            }
                        }
                        break;
                    default:
                        statusMessage = `Your appointment status: ${todayAppointment.status}`;
                }
                return `📊 *Your Queue Status*

${statusMessage}

*Appointment Details:*
📅 Date: ${(0, date_fns_1.format)(new Date(todayAppointment.appointmentDate), 'dd/MM/yyyy')}
🕐 Time: ${todayAppointment.appointmentTime}
🏥 Type: ${todayAppointment.visitType}

Reply *MENU* to return to main menu.`;
            default:
                return `❌ Invalid option. Please reply with a number from 1-10.`;
        }
    }
    async findPatientByChatId(chatId) {
        const chatIdNum = parseInt(chatId);
        if (isNaN(chatIdNum)) {
            return null;
        }
        return await this.patientsService.findByTelegramChatId(chatIdNum);
    }
    async handleNameInput(chatId, message, state, username) {
        state.data.fullName = message.trim();
        let patient = await this.findPatientByChatId(chatId);
        if (!patient) {
            patient = await this.patientsService.create({
                fullName: state.data.fullName,
                phoneNumber: `telegram_${chatId}`,
                isReturningPatient: false,
                telegramChatId: parseInt(chatId),
                telegramUsername: username,
            });
        }
        else {
            if (patient.fullName !== state.data.fullName ||
                (username && patient.telegramUsername !== username)) {
                await this.patientsService.update(patient.id, {
                    fullName: state.data.fullName,
                    telegramUsername: username,
                });
            }
        }
        state.data.patientId = patient.id;
        if (state.step === 'pregnancy_first_visit_name') {
            state.step = 'pregnancy_first_visit_lmp';
            return `Please provide the date of your Last Menstrual Period (LMP).

Format: DD/MM/YYYY (e.g., 15/11/2024)

*Reply with the date*`;
        }
        else if (state.step === 'pregnancy_followup_name') {
            state.step = 'pregnancy_followup_lmp';
            return `Please provide the date of your Last Menstrual Period (LMP).

Format: DD/MM/YYYY (e.g., 15/11/2024)

*Reply with the date*`;
        }
        else {
            state.step = 'select_date';
            return await this.handleDateSelection(chatId, '', state);
        }
    }
    async handleLMPInput(chatId, message, state) {
        try {
            const lmpDate = (0, date_fns_1.parse)(message.trim(), 'dd/MM/yyyy', new Date());
            if (isNaN(lmpDate.getTime())) {
                return `❌ Invalid date format. Please use DD/MM/YYYY format (e.g., 15/11/2024)`;
            }
            state.data.lmpDate = (0, date_fns_1.format)(lmpDate, 'yyyy-MM-dd');
            if (state.step === 'pregnancy_first_visit_lmp') {
                state.step = 'pregnancy_first_visit_previous';
                return `Is this your first pregnancy?

1️⃣ Yes, first pregnancy
2️⃣ No, I've had previous pregnancies

*Reply with 1 or 2*`;
            }
            else {
                state.step = 'pregnancy_followup_symptoms';
                return `Do you have any current warning symptoms?

1️⃣ No symptoms
2️⃣ Bleeding
3️⃣ Reduced fetal movements
4️⃣ Severe pain
5️⃣ Other symptoms

*Reply with the number*`;
            }
        }
        catch (error) {
            return `❌ Invalid date format. Please use DD/MM/YYYY format (e.g., 15/11/2024)`;
        }
    }
    async handlePreviousPregnancy(chatId, message, state) {
        if (message.includes('1') || message.includes('yes') || message.includes('first')) {
            state.data.firstPregnancy = true;
        }
        else {
            state.data.firstPregnancy = false;
        }
        state.step = 'select_date';
        return await this.handleDateSelection(chatId, '', state);
    }
    async handlePregnancySymptoms(chatId, message, state) {
        state.data.symptoms = message;
        state.step = 'select_date';
        return await this.handleDateSelection(chatId, '', state);
    }
    async handleLastDelivery(chatId, message, state) {
        try {
            const deliveryDate = (0, date_fns_1.parse)(message.trim(), 'dd/MM/yyyy', new Date());
            if (!isNaN(deliveryDate.getTime())) {
                state.data.lastDeliveryDate = (0, date_fns_1.format)(deliveryDate, 'yyyy-MM-dd');
            }
        }
        catch (error) {
        }
        state.step = 'family_planning_breastfeeding';
        return `Are you currently breastfeeding?

1️⃣ Yes
2️⃣ No

*Reply with 1 or 2*`;
    }
    async handleBreastfeeding(chatId, message, state) {
        state.data.breastfeeding = message.includes('1') || message.includes('yes');
        state.step = 'select_date';
        return await this.handleDateSelection(chatId, '', state);
    }
    async handleInfertilityDuration(chatId, message, state) {
        state.data.infertilityDuration = message;
        state.step = 'select_date';
        return await this.handleDateSelection(chatId, '', state);
    }
    async handleEmergencySymptom(chatId, message, state) {
        const symptoms = [
            'Heavy vaginal bleeding',
            'Decreased/absent fetal movement',
            'Sudden severe abdominal/pelvic pain',
            'Leakage of amniotic fluid',
            'Severe pain/infection at C-section wound',
            'High fever + severe headache + visual disturbances',
            'Other urgent symptom',
        ];
        const index = parseInt(message) - 1;
        if (index >= 0 && index < symptoms.length) {
            state.data.emergencySymptom = symptoms[index];
        }
        state.step = 'emergency_when';
        return `When did this symptom start?

*Reply with approximate time (e.g., "2 hours ago", "this morning")*`;
    }
    async handleEmergencyWhen(chatId, message, state) {
        state.data.emergencyWhen = message;
        state.step = 'emergency_pregnant';
        return `Are you currently pregnant?

1️⃣ Yes
2️⃣ No

*Reply with 1 or 2*`;
    }
    async handleEmergencyPregnant(chatId, message, state) {
        const isPregnant = message.includes('1') || message.includes('yes');
        state.data.emergencyPregnant = isPregnant;
        if (isPregnant) {
            return `How many weeks pregnant are you? (if you know)

*Reply with number of weeks, or "I don't know"*`;
        }
        const today = (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd');
        const availableSlots = await this.appointmentsService.getAvailableTimeSlots(today);
        if (availableSlots.length === 0) {
            return `🚨 *EMERGENCY CASE REGISTERED*

Your case has been marked as urgent. Please come to the clinic immediately and inform the reception that you are an emergency case.

*If this is a life-threatening emergency, please go to the nearest hospital emergency department immediately.*`;
        }
        state.data.appointmentDate = today;
        state.data.appointmentTime = availableSlots[0];
        state.step = 'confirm_booking';
        return await this.handleBookingConfirmation(chatId, 'yes', state);
    }
    async handleDateSelection(chatId, message, state) {
        if (message && message.trim()) {
            try {
                const selectedDate = (0, date_fns_1.parse)(message.trim(), 'dd/MM/yyyy', new Date());
                if (isNaN(selectedDate.getTime())) {
                    return `❌ Invalid date format. Please use DD/MM/YYYY`;
                }
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate < today) {
                    return `❌ Cannot book appointments in the past. Please select a future date.`;
                }
                state.data.appointmentDate = (0, date_fns_1.format)(selectedDate, 'yyyy-MM-dd');
                state.step = 'select_time';
                return await this.handleTimeSelection(chatId, '', state);
            }
            catch (error) {
                return `❌ Invalid date format. Please use DD/MM/YYYY (e.g., 15/12/2024)`;
            }
        }
        const availableDates = await this.appointmentsService.getAvailableDates();
        const dateOptions = availableDates.slice(0, 7).map((date, index) => {
            return `${index + 1}️⃣ ${(0, date_fns_1.format)(date, 'dd/MM/yyyy (EEEE)')}`;
        }).join('\n');
        return `📅 *Select Appointment Date:*

${dateOptions}

*Reply with the number or type the date in DD/MM/YYYY format*`;
    }
    async handleTimeSelection(chatId, message, state) {
        if (!state.data.appointmentDate) {
            state.step = 'select_date';
            return await this.handleDateSelection(chatId, '', state);
        }
        let selectedTime;
        const numberMatch = message.match(/^\d+/)?.[0];
        if (numberMatch) {
            const slots = await this.appointmentsService.getAvailableTimeSlots(state.data.appointmentDate);
            const index = parseInt(numberMatch) - 1;
            if (index >= 0 && index < slots.length) {
                selectedTime = slots[index];
            }
            else {
                return `❌ Invalid selection. Please choose a number from the list.`;
            }
        }
        else if (message.trim()) {
            const timeMatch = message.match(/\d{1,2}:\d{2}/)?.[0];
            if (timeMatch) {
                selectedTime = timeMatch.padStart(5, '0');
            }
            else {
                return `❌ Invalid time format. Please provide time in HH:MM format or select a number.`;
            }
        }
        else {
            const slots = await this.appointmentsService.getAvailableTimeSlots(state.data.appointmentDate);
            if (slots.length === 0) {
                return `❌ No available time slots for this date. Please select another date.`;
            }
            const timeOptions = slots.slice(0, 10).map((slot, index) => {
                return `${index + 1}️⃣ ${slot}`;
            }).join('\n');
            return `⏰ *Select Time Slot:*

${timeOptions}

*Reply with the number or time (e.g., "09:00")*`;
        }
        state.data.appointmentTime = selectedTime;
        state.step = 'confirm_booking';
        const dateFormatted = (0, date_fns_1.format)((0, date_fns_1.parse)(state.data.appointmentDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy (EEEE)');
        return `✅ *Appointment Summary:*

📋 Visit Type: ${this.getVisitTypeDisplay(state.data.visitType || appointment_entity_1.VisitType.GENERAL_GYNE)}
📅 Date: ${dateFormatted}
⏰ Time: ${selectedTime}

*Confirm your appointment?*
1️⃣ Yes, confirm
2️⃣ No, cancel

*Reply with 1 or 2*`;
    }
    async handleBookingConfirmation(chatId, message, state) {
        if (!message.includes('1') && !message.includes('yes') && !message.includes('confirm')) {
            this.conversations.delete(chatId);
            return `Booking cancelled. You can start a new booking anytime by sending any message.`;
        }
        let patient = await this.findPatientByChatId(chatId);
        if (!patient && !state.data.patientId) {
            return `❌ Patient information missing. Please start over.`;
        }
        if (!patient) {
            patient = await this.patientsService.findOne(state.data.patientId);
        }
        const appointment = await this.appointmentsService.create({
            patientId: patient.id,
            visitType: state.data.visitType || appointment_entity_1.VisitType.GENERAL_GYNE,
            appointmentDate: state.data.appointmentDate,
            appointmentTime: state.data.appointmentTime,
            emergencyFlag: state.data.emergencyFlag || false,
            source: appointment_entity_1.AppointmentSource.TELEGRAM,
            bookingData: state.data,
            notes: this.buildAppointmentNotes(state),
        });
        await this.notificationsService.sendBookingConfirmation(appointment.id);
        this.conversations.delete(chatId);
        const dateFormatted = (0, date_fns_1.format)((0, date_fns_1.parse)(appointment.appointmentDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy');
        return `✅ *APPOINTMENT CONFIRMED!*

📋 Visit: ${this.getVisitTypeDisplay(appointment.visitType)}
📅 Date: ${dateFormatted}
⏰ Time: ${appointment.appointmentTime}
🔢 Queue Number: #${appointment.queueNumber}

*Please arrive 10-15 minutes before your appointment time.*

Thank you for choosing our clinic! We look forward to seeing you.

Reply *MENU* to return to main menu.`;
    }
    getVisitTypeDisplay(visitType) {
        const labels = {
            [appointment_entity_1.VisitType.PREGNANCY_FIRST_VISIT]: 'Pregnancy First Visit',
            [appointment_entity_1.VisitType.PREGNANCY_FOLLOWUP]: 'Pregnancy Follow-up',
            [appointment_entity_1.VisitType.ULTRASOUND]: 'Ultrasound',
            [appointment_entity_1.VisitType.POSTPARTUM_NORMAL]: 'Postpartum Follow-up (Normal)',
            [appointment_entity_1.VisitType.POSTPARTUM_CSECTION]: 'Postpartum Follow-up (C-section)',
            [appointment_entity_1.VisitType.FAMILY_PLANNING]: 'Family Planning',
            [appointment_entity_1.VisitType.INFERTILITY]: 'Infertility Consultation',
            [appointment_entity_1.VisitType.GENERAL_GYNE]: 'General Gynecology',
            [appointment_entity_1.VisitType.PAP_SMEAR]: 'Pap Smear',
            [appointment_entity_1.VisitType.EMERGENCY]: 'Emergency Visit',
        };
        return labels[visitType] || visitType;
    }
    buildAppointmentNotes(state) {
        const notes = [];
        if (state.data.emergencySymptom) {
            notes.push(`Emergency symptom: ${state.data.emergencySymptom}`);
            if (state.data.emergencyWhen) {
                notes.push(`Started: ${state.data.emergencyWhen}`);
            }
            if (state.data.emergencyPregnant !== undefined) {
                notes.push(`Currently pregnant: ${state.data.emergencyPregnant ? 'Yes' : 'No'}`);
            }
        }
        if (state.data.lmpDate) {
            notes.push(`LMP: ${state.data.lmpDate}`);
        }
        if (state.data.symptoms) {
            notes.push(`Symptoms: ${state.data.symptoms}`);
        }
        return notes.join('\n');
    }
};
exports.ConversationService = ConversationService;
exports.ConversationService = ConversationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [patients_service_1.PatientsService,
        appointments_service_1.AppointmentsService,
        notifications_service_1.NotificationsService,
        queue_service_1.QueueService])
], ConversationService);
//# sourceMappingURL=conversation.service.js.map