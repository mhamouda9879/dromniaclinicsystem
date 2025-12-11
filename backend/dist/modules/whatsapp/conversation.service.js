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
    async processMessage(phoneNumber, message) {
        this.cleanupExpiredSessions();
        const normalizedMessage = message.trim().toLowerCase();
        const state = this.getOrCreateState(phoneNumber);
        if (this.isMenuKeyword(normalizedMessage)) {
            state.step = 'menu';
            state.data = {};
            return this.getMainMenu();
        }
        switch (state.step) {
            case 'menu':
                return await this.handleMenuSelection(phoneNumber, normalizedMessage, state);
            case 'pregnancy_first_visit_name':
            case 'pregnancy_followup_name':
            case 'ultrasound_name':
            case 'postpartum_name':
            case 'family_planning_name':
            case 'infertility_name':
            case 'general_gyne_name':
            case 'pap_smear_name':
                return await this.handleNameInput(phoneNumber, normalizedMessage, state);
            case 'pregnancy_first_visit_lmp':
            case 'pregnancy_followup_lmp':
                return await this.handleLMPInput(phoneNumber, normalizedMessage, state);
            case 'pregnancy_first_visit_previous':
                return await this.handlePreviousPregnancy(phoneNumber, normalizedMessage, state);
            case 'pregnancy_followup_symptoms':
                return await this.handlePregnancySymptoms(phoneNumber, normalizedMessage, state);
            case 'family_planning_last_delivery':
                return await this.handleLastDelivery(phoneNumber, normalizedMessage, state);
            case 'family_planning_breastfeeding':
                return await this.handleBreastfeeding(phoneNumber, normalizedMessage, state);
            case 'infertility_duration':
                return await this.handleInfertilityDuration(phoneNumber, normalizedMessage, state);
            case 'emergency_symptom':
                return await this.handleEmergencySymptom(phoneNumber, normalizedMessage, state);
            case 'emergency_when':
                return await this.handleEmergencyWhen(phoneNumber, normalizedMessage, state);
            case 'emergency_pregnant':
                return await this.handleEmergencyPregnant(phoneNumber, normalizedMessage, state);
            case 'select_date':
                return await this.handleDateSelection(phoneNumber, normalizedMessage, state);
            case 'select_time':
                return await this.handleTimeSelection(phoneNumber, normalizedMessage, state);
            case 'confirm_booking':
                return await this.handleBookingConfirmation(phoneNumber, normalizedMessage, state);
            default:
                state.step = 'menu';
                return this.getMainMenu();
        }
    }
    getMainMenu() {
        return `👋 Welcome to OB/GYN Clinic!

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
    async handleMenuSelection(phoneNumber, message, state) {
        const option = message.match(/^\d+/)?.[0];
        switch (option) {
            case '1':
                state.step = 'pregnancy_visit_type';
                return `Are you booking for:
1️⃣ First pregnancy visit
2️⃣ Pregnancy follow-up

*Reply with 1 or 2*`;
            case '2':
                state.step = 'ultrasound_name';
                state.data.visitType = appointment_entity_1.VisitType.ULTRASOUND;
                return `Please provide your full name:`;
            case '3':
                state.step = 'postpartum_name';
                state.data.visitType = appointment_entity_1.VisitType.POSTPARTUM_NORMAL;
                return `Please provide your full name:`;
            case '4':
                state.step = 'family_planning_name';
                state.data.visitType = appointment_entity_1.VisitType.FAMILY_PLANNING;
                return `Please provide your full name:`;
            case '5':
                state.step = 'infertility_name';
                state.data.visitType = appointment_entity_1.VisitType.INFERTILITY;
                return `Please provide your full name:`;
            case '6':
                state.step = 'general_gyne_name';
                state.data.visitType = appointment_entity_1.VisitType.GENERAL_GYNE;
                return `Please provide your full name:`;
            case '7':
                state.step = 'pap_smear_name';
                state.data.visitType = appointment_entity_1.VisitType.PAP_SMEAR;
                return `Please provide your full name:`;
            case '8':
                state.step = 'emergency_symptom';
                state.data.emergencyFlag = true;
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
                const patient = await this.patientsService.findByPhoneNumber(phoneNumber);
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
    async handleNameInput(phoneNumber, message, state) {
        state.data.fullName = message.trim();
        let patient = await this.patientsService.findByPhoneNumber(phoneNumber);
        if (!patient) {
            patient = await this.patientsService.create({
                fullName: state.data.fullName,
                phoneNumber,
                whatsappId: phoneNumber,
                isReturningPatient: false,
            });
        }
        else {
            if (patient.fullName !== state.data.fullName) {
                await this.patientsService.update(patient.id, {
                    fullName: state.data.fullName,
                });
            }
        }
        state.data.patientId = patient.id;
        const visitType = state.data.visitType;
        if (visitType === appointment_entity_1.VisitType.PREGNANCY_FIRST_VISIT) {
            state.step = 'pregnancy_first_visit_lmp';
            return `What was the date of your Last Menstrual Period (LMP)?
Please provide in format: DD/MM/YYYY
(e.g., 15/03/2024)`;
        }
        if (visitType === appointment_entity_1.VisitType.PREGNANCY_FOLLOWUP) {
            state.step = 'pregnancy_followup_lmp';
            return `What was the date of your Last Menstrual Period (LMP)?
Please provide in format: DD/MM/YYYY`;
        }
        if (visitType === appointment_entity_1.VisitType.FAMILY_PLANNING) {
            state.step = 'family_planning_last_delivery';
            return `When was your last delivery?
Please provide in format: DD/MM/YYYY
(If not applicable, type "none")`;
        }
        if (visitType === appointment_entity_1.VisitType.INFERTILITY) {
            state.step = 'infertility_duration';
            return `How long have you been trying to conceive?
(e.g., "6 months", "1 year", "2 years")`;
        }
        state.step = 'select_date';
        return await this.getAvailableDatesMessage();
    }
    async handleLMPInput(phoneNumber, message, state) {
        try {
            const lmpDate = (0, date_fns_1.parse)(message.trim(), 'dd/MM/yyyy', new Date());
            state.data.lmpDate = lmpDate.toISOString();
            const weeks = (0, date_fns_1.differenceInWeeks)(new Date(), lmpDate);
            if (state.data.visitType === appointment_entity_1.VisitType.PREGNANCY_FIRST_VISIT) {
                state.step = 'pregnancy_first_visit_previous';
                return `Is this your first pregnancy?
1️⃣ Yes, first pregnancy
2️⃣ No, I've been pregnant before

*Reply with 1 or 2*`;
            }
            if (state.data.visitType === appointment_entity_1.VisitType.PREGNANCY_FOLLOWUP) {
                state.step = 'pregnancy_followup_symptoms';
                state.data.gestationWeeks = weeks;
                return `Are you experiencing any warning symptoms?
1️⃣ No symptoms
2️⃣ Bleeding
3️⃣ Reduced fetal movements
4️⃣ Severe pain
5️⃣ Severe headache
6️⃣ Swelling of legs/face
7️⃣ Other

*Reply with the number (or multiple numbers separated by comma)*`;
            }
            state.step = 'select_date';
            return await this.getAvailableDatesMessage();
        }
        catch (error) {
            return `❌ Invalid date format. Please provide in DD/MM/YYYY format.
Example: 15/03/2024`;
        }
    }
    async handlePreviousPregnancy(phoneNumber, message, state) {
        if (message.includes('1') || message.includes('yes') || message.includes('first')) {
            state.data.isFirstPregnancy = true;
        }
        else {
            state.data.isFirstPregnancy = false;
        }
        state.step = 'select_date';
        return await this.getAvailableDatesMessage();
    }
    async handlePregnancySymptoms(phoneNumber, message, state) {
        state.data.symptoms = message;
        if (message.includes('2') || message.includes('3') || message.includes('4')) {
            state.data.emergencyFlag = true;
        }
        state.step = 'select_date';
        return await this.getAvailableDatesMessage();
    }
    async handleLastDelivery(phoneNumber, message, state) {
        if (message.toLowerCase().includes('none') || message.toLowerCase().includes('n/a')) {
            state.step = 'select_date';
            return await this.getAvailableDatesMessage();
        }
        try {
            const deliveryDate = (0, date_fns_1.parse)(message.trim(), 'dd/MM/yyyy', new Date());
            state.data.lastDeliveryDate = deliveryDate.toISOString();
            state.step = 'family_planning_delivery_type';
            return `What was the type of delivery?
1️⃣ Normal delivery
2️⃣ C-section

*Reply with 1 or 2*`;
        }
        catch (error) {
            return `❌ Invalid date format. Please provide in DD/MM/YYYY format or type "none".`;
        }
    }
    async handleBreastfeeding(phoneNumber, message, state) {
        if (message.includes('1') || message.includes('yes')) {
            state.data.isBreastfeeding = true;
        }
        else {
            state.data.isBreastfeeding = false;
        }
        state.step = 'select_date';
        return await this.getAvailableDatesMessage();
    }
    async handleInfertilityDuration(phoneNumber, message, state) {
        state.data.infertilityDuration = message;
        state.step = 'select_date';
        return await this.getAvailableDatesMessage();
    }
    async handleEmergencySymptom(phoneNumber, message, state) {
        state.data.emergencySymptom = message;
        state.step = 'emergency_when';
        return `When did this symptom start?
Please provide approximate time (e.g., "2 hours ago", "this morning", "30 minutes ago")`;
    }
    async handleEmergencyWhen(phoneNumber, message, state) {
        state.data.emergencyWhen = message;
        state.step = 'emergency_pregnant';
        return `Are you currently pregnant?
1️⃣ Yes
2️⃣ No

*Reply with 1 or 2*`;
    }
    async handleEmergencyPregnant(phoneNumber, message, state) {
        const isPregnant = message.includes('1') || message.includes('yes');
        state.data.isPregnant = isPregnant;
        if (isPregnant) {
            state.step = 'emergency_weeks';
            return `How many weeks pregnant are you?
(If you don't know, type "unknown")`;
        }
        else {
            return await this.createEmergencyAppointment(phoneNumber, state);
        }
    }
    async createEmergencyAppointment(phoneNumber, state) {
        let patient = await this.patientsService.findByPhoneNumber(phoneNumber);
        if (!patient) {
            patient = await this.patientsService.create({
                fullName: state.data.fullName || 'Emergency Patient',
                phoneNumber,
                whatsappId: phoneNumber,
                isReturningPatient: false,
            });
            state.data.patientId = patient.id;
        }
        const today = new Date();
        const appointmentDate = (0, date_fns_1.format)(today, 'yyyy-MM-dd');
        const availableSlots = await this.appointmentsService.getAvailableTimeSlots(appointmentDate);
        let appointmentTime = availableSlots[0] || '09:00';
        if (availableSlots.length === 0) {
            const tomorrow = (0, date_fns_1.addDays)(today, 1);
            const tomorrowDate = (0, date_fns_1.format)(tomorrow, 'yyyy-MM-dd');
            const tomorrowSlots = await this.appointmentsService.getAvailableTimeSlots(tomorrowDate);
            if (tomorrowSlots.length > 0) {
                appointmentTime = tomorrowSlots[0];
            }
        }
        const appointment = await this.appointmentsService.create({
            patientId: patient.id,
            visitType: appointment_entity_1.VisitType.EMERGENCY,
            appointmentDate,
            appointmentTime,
            emergencyFlag: true,
            source: 'whatsapp',
            bookingData: state.data,
            notes: `Emergency: ${state.data.emergencySymptom}. Started: ${state.data.emergencyWhen}`,
        });
        this.conversations.delete(phoneNumber);
        return `🚨 *EMERGENCY APPOINTMENT CONFIRMED*

Your case has been marked as urgent and prioritized.

*Appointment Details:*
📅 Date: ${(0, date_fns_1.format)((0, date_fns_1.parse)(appointmentDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')}
⏰ Time: ${appointmentTime}
📍 Queue: #${appointment.queueNumber}

⚠️ *Please come to the clinic immediately* and inform reception that you are an emergency case.

If the clinic is closed, please go to the nearest hospital emergency department immediately.

*Your safety is our priority.*`;
    }
    async getAvailableDatesMessage() {
        const dates = await this.appointmentsService.getAvailableDates();
        const dateOptions = dates.slice(0, 7).map((date, index) => {
            const formatted = (0, date_fns_1.format)(date, 'dd/MM/yyyy (EEEE)');
            return `${index + 1}️⃣ ${formatted}`;
        }).join('\n');
        return `📅 *Select Appointment Date:*

${dateOptions}

*Reply with the number (1-7) or provide a date in DD/MM/YYYY format*`;
    }
    async handleDateSelection(phoneNumber, message, state) {
        let selectedDate;
        const numberMatch = message.match(/^\d+/)?.[0];
        if (numberMatch) {
            const dates = await this.appointmentsService.getAvailableDates();
            const index = parseInt(numberMatch) - 1;
            if (index >= 0 && index < dates.length) {
                selectedDate = dates[index];
            }
            else {
                return `❌ Invalid selection. Please choose a number from the list.`;
            }
        }
        else {
            try {
                selectedDate = (0, date_fns_1.parse)(message.trim(), 'dd/MM/yyyy', new Date());
            }
            catch {
                return `❌ Invalid date format. Please provide in DD/MM/YYYY format or select a number.`;
            }
        }
        state.data.appointmentDate = (0, date_fns_1.format)(selectedDate, 'yyyy-MM-dd');
        state.step = 'select_time';
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
    async handleTimeSelection(phoneNumber, message, state) {
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
        else {
            const timeMatch = message.match(/\d{1,2}:\d{2}/)?.[0];
            if (timeMatch) {
                selectedTime = timeMatch.padStart(5, '0');
            }
            else {
                return `❌ Invalid time format. Please provide time in HH:MM format or select a number.`;
            }
        }
        state.data.appointmentTime = selectedTime;
        state.step = 'confirm_booking';
        const dateFormatted = (0, date_fns_1.format)((0, date_fns_1.parse)(state.data.appointmentDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy (EEEE)');
        return `✅ *Appointment Summary:*

📋 Visit Type: ${this.getVisitTypeDisplay(state.data.visitType)}
📅 Date: ${dateFormatted}
⏰ Time: ${selectedTime}

*Confirm your appointment?*
1️⃣ Yes, confirm
2️⃣ No, cancel

*Reply with 1 or 2*`;
    }
    async handleBookingConfirmation(phoneNumber, message, state) {
        if (!message.includes('1') && !message.includes('yes') && !message.includes('confirm')) {
            this.conversations.delete(phoneNumber);
            return `Booking cancelled. You can start a new booking anytime by sending any message.`;
        }
        let patient = await this.patientsService.findByPhoneNumber(phoneNumber);
        if (!patient && !state.data.patientId) {
            return `❌ Patient information missing. Please start over.`;
        }
        if (!patient) {
            patient = await this.patientsService.findOne(state.data.patientId);
        }
        const appointment = await this.appointmentsService.create({
            patientId: patient.id,
            visitType: state.data.visitType,
            appointmentDate: state.data.appointmentDate,
            appointmentTime: state.data.appointmentTime,
            emergencyFlag: state.data.emergencyFlag || false,
            source: 'whatsapp',
            bookingData: state.data,
            notes: this.buildAppointmentNotes(state),
        });
        await this.notificationsService.sendBookingConfirmation(appointment.id);
        this.conversations.delete(phoneNumber);
        const appointmentDateStr = typeof appointment.appointmentDate === 'string'
            ? appointment.appointmentDate
            : (0, date_fns_1.format)(appointment.appointmentDate, 'yyyy-MM-dd');
        const dateFormatted = (0, date_fns_1.format)((0, date_fns_1.parse)(appointmentDateStr, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy');
        return `✅ *APPOINTMENT CONFIRMED!*

📋 Visit: ${this.getVisitTypeDisplay(appointment.visitType)}
📅 Date: ${dateFormatted}
⏰ Time: ${appointment.appointmentTime}
🔢 Queue Number: #${appointment.queueNumber}

*Please arrive 10-15 minutes before your appointment time.*

You will receive a reminder before your appointment.

Thank you for choosing our clinic! 🙏`;
    }
    getVisitTypeDisplay(visitType) {
        const displays = {
            [appointment_entity_1.VisitType.PREGNANCY_FIRST_VISIT]: 'First Pregnancy Visit',
            [appointment_entity_1.VisitType.PREGNANCY_FOLLOWUP]: 'Pregnancy Follow-up',
            [appointment_entity_1.VisitType.ULTRASOUND]: 'Ultrasound',
            [appointment_entity_1.VisitType.POSTPARTUM_NORMAL]: 'Postpartum Follow-up (Normal)',
            [appointment_entity_1.VisitType.POSTPARTUM_CSECTION]: 'Postpartum Follow-up (C-section)',
            [appointment_entity_1.VisitType.FAMILY_PLANNING]: 'Family Planning',
            [appointment_entity_1.VisitType.INFERTILITY]: 'Infertility Consultation',
            [appointment_entity_1.VisitType.GENERAL_GYNE]: 'General Gynecology',
            [appointment_entity_1.VisitType.PAP_SMEAR]: 'Pap Smear',
            [appointment_entity_1.VisitType.EMERGENCY]: 'Emergency',
        };
        return displays[visitType] || visitType;
    }
    buildAppointmentNotes(state) {
        const notes = [];
        if (state.data.lmpDate) {
            notes.push(`LMP: ${(0, date_fns_1.format)((0, date_fns_1.parse)(state.data.lmpDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')}`);
        }
        if (state.data.gestationWeeks) {
            notes.push(`Gestation: ${state.data.gestationWeeks} weeks`);
        }
        if (state.data.symptoms) {
            notes.push(`Symptoms: ${state.data.symptoms}`);
        }
        if (state.data.isBreastfeeding !== undefined) {
            notes.push(`Breastfeeding: ${state.data.isBreastfeeding ? 'Yes' : 'No'}`);
        }
        if (state.data.infertilityDuration) {
            notes.push(`Trying to conceive: ${state.data.infertilityDuration}`);
        }
        return notes.join(' | ');
    }
    getOrCreateState(phoneNumber) {
        if (!this.conversations.has(phoneNumber)) {
            this.conversations.set(phoneNumber, {
                phoneNumber,
                step: 'menu',
                data: {},
                lastActivity: new Date(),
            });
        }
        const state = this.conversations.get(phoneNumber);
        state.lastActivity = new Date();
        return state;
    }
    isMenuKeyword(message) {
        const keywords = ['menu', 'start', 'hi', 'hello', 'help', 'cancel'];
        return keywords.some((keyword) => message.includes(keyword));
    }
    cleanupExpiredSessions() {
        const now = new Date();
        for (const [phoneNumber, state] of this.conversations.entries()) {
            if (now.getTime() - state.lastActivity.getTime() > this.SESSION_TIMEOUT) {
                this.conversations.delete(phoneNumber);
            }
        }
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