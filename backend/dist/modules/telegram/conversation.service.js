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
const languages_1 = require("./languages");
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
        if (this.isMenuKeyword(normalizedMessage) || this.isGreeting(normalizedMessage)) {
            if (state.language) {
                state.step = 'menu';
                state.data = {};
                return this.getMainMenu(state.language);
            }
            else {
                state.step = 'select_language';
                return this.getLanguageSelection();
            }
        }
        switch (state.step) {
            case 'select_language':
                return await this.handleLanguageSelection(chatId, normalizedMessage, state);
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
                if (state.language) {
                    state.step = 'menu';
                    return this.getMainMenu(state.language);
                }
                else {
                    state.step = 'select_language';
                    return this.getLanguageSelection();
                }
        }
    }
    getLanguageSelection() {
        return (0, languages_1.translate)('welcome', languages_1.Language.ENGLISH) + '\n\n' + (0, languages_1.translate)('selectLanguage', languages_1.Language.ENGLISH);
    }
    async handleLanguageSelection(chatId, message, state) {
        const selection = message.trim();
        if (selection === '1' || selection.includes('english') || selection.includes('انجليزي')) {
            state.language = languages_1.Language.ENGLISH;
            state.step = 'menu';
            return this.getMainMenu(languages_1.Language.ENGLISH);
        }
        else if (selection === '2' || selection.includes('arabic') || selection.includes('عربي') || selection.includes('العربية')) {
            state.language = languages_1.Language.ARABIC;
            state.step = 'menu';
            return this.getMainMenu(languages_1.Language.ARABIC);
        }
        else {
            return (0, languages_1.translate)('welcome', languages_1.Language.ENGLISH) + '\n\n' + (0, languages_1.translate)('selectLanguage', languages_1.Language.ENGLISH);
        }
    }
    getMainMenu(lang) {
        return (0, languages_1.translate)('menu', lang);
    }
    getOrCreateState(chatId) {
        if (!this.conversations.has(chatId)) {
            this.conversations.set(chatId, {
                chatId,
                step: 'select_language',
                data: {},
                lastActivity: new Date(),
                language: languages_1.Language.ENGLISH,
            });
        }
        const state = this.conversations.get(chatId);
        state.lastActivity = new Date();
        if (!state.language) {
            state.step = 'select_language';
        }
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
        const keywords = ['menu', 'start', 'begin', 'help', 'options', 'main', '/start', '/menu'];
        return keywords.some((keyword) => message.includes(keyword));
    }
    isGreeting(message) {
        const greetings = ['hi', 'hello', 'hey', 'hii', 'hi there', 'good morning', 'good afternoon', 'good evening', 'salam', 'السلام عليكم'];
        return greetings.some((greeting) => message === greeting || message.startsWith(greeting + ' '));
    }
    async handleMenuSelection(chatId, message, state) {
        const selection = message.trim();
        const lang = state.language || languages_1.Language.ENGLISH;
        switch (selection) {
            case '1':
                state.step = 'pregnancy_first_visit_name';
                return (0, languages_1.translate)('bookPregnancyVisit', lang);
            case '2':
                state.step = 'ultrasound_name';
                state.data.visitType = appointment_entity_1.VisitType.ULTRASOUND;
                return (0, languages_1.translate)('provideFullName', lang);
            case '3':
                state.step = 'postpartum_name';
                return (0, languages_1.translate)('provideFullName', lang);
            case '4':
                state.step = 'family_planning_name';
                state.data.visitType = appointment_entity_1.VisitType.FAMILY_PLANNING;
                return (0, languages_1.translate)('provideFullName', lang);
            case '5':
                state.step = 'infertility_name';
                state.data.visitType = appointment_entity_1.VisitType.INFERTILITY;
                return (0, languages_1.translate)('provideFullName', lang);
            case '6':
                state.step = 'general_gyne_name';
                state.data.visitType = appointment_entity_1.VisitType.GENERAL_GYNE;
                return (0, languages_1.translate)('provideFullName', lang);
            case '7':
                state.step = 'pap_smear_name';
                state.data.visitType = appointment_entity_1.VisitType.PAP_SMEAR;
                return (0, languages_1.translate)('provideFullName', lang);
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
                    return (0, languages_1.translate)('patientNotFound', lang);
                }
                const today = (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd');
                const todayAppointments = await this.appointmentsService.findByDate(today);
                const todayAppointment = todayAppointments.find((apt) => apt.patientId === patient.id &&
                    apt.status !== appointment_entity_1.AppointmentStatus.CANCELLED &&
                    apt.status !== appointment_entity_1.AppointmentStatus.FINISHED &&
                    apt.status !== appointment_entity_1.AppointmentStatus.NO_SHOW);
                if (!todayAppointment) {
                    return (0, languages_1.translate)('noAppointmentToday', lang);
                }
                const queuePosition = await this.queueService.getQueuePosition(patient.id);
                const estimatedWaitTime = queuePosition
                    ? await this.queueService.getEstimatedWaitTime(queuePosition)
                    : null;
                let statusMessage = '';
                switch (todayAppointment.status) {
                    case appointment_entity_1.AppointmentStatus.WITH_DOCTOR:
                        statusMessage = lang === languages_1.Language.ARABIC ? '✅ أنت حالياً مع الطبيب.' : '✅ You are currently with the doctor.';
                        break;
                    case appointment_entity_1.AppointmentStatus.ARRIVED:
                        statusMessage = lang === languages_1.Language.ARABIC
                            ? `🟢 لقد وصلت. موقعك في الطابور: ${queuePosition || 'غير متوفر'}`
                            : `🟢 You have arrived. Queue position: ${queuePosition || 'N/A'}`;
                        if (estimatedWaitTime !== null && queuePosition) {
                            statusMessage += lang === languages_1.Language.ARABIC
                                ? `\n⏱️ وقت الانتظار المتوقع: ${estimatedWaitTime} دقيقة`
                                : `\n⏱️ Estimated wait time: ${estimatedWaitTime} minutes`;
                        }
                        break;
                    case appointment_entity_1.AppointmentStatus.CONFIRMED:
                    case appointment_entity_1.AppointmentStatus.BOOKED:
                        if (lang === languages_1.Language.ARABIC) {
                            statusMessage = `📋 تم تأكيد موعدك.\n`;
                            statusMessage += `⏰ الوقت: ${todayAppointment.appointmentTime}\n`;
                            statusMessage += `📝 رقم الدور: ${todayAppointment.queueNumber || 'سيتم تعيينه'}`;
                            if (queuePosition) {
                                statusMessage += `\n📍 موقعك الحالي في الطابور: ${queuePosition}`;
                                if (estimatedWaitTime !== null) {
                                    statusMessage += `\n⏱️ وقت الانتظار المتوقع: ${estimatedWaitTime} دقيقة`;
                                }
                            }
                        }
                        else {
                            statusMessage = `📋 Your appointment is confirmed.\n`;
                            statusMessage += `⏰ Time: ${todayAppointment.appointmentTime}\n`;
                            statusMessage += `📝 Queue Number: ${todayAppointment.queueNumber || 'To be assigned'}`;
                            if (queuePosition) {
                                statusMessage += `\n📍 Current position in queue: ${queuePosition}`;
                                if (estimatedWaitTime !== null) {
                                    statusMessage += `\n⏱️ Estimated wait time: ${estimatedWaitTime} minutes`;
                                }
                            }
                        }
                        break;
                    default:
                        statusMessage = lang === languages_1.Language.ARABIC
                            ? `حالة موعدك: ${todayAppointment.status}`
                            : `Your appointment status: ${todayAppointment.status}`;
                }
                const visitTypeLabel = this.getVisitTypeDisplay(todayAppointment.visitType, lang);
                const dateFormatted = (0, date_fns_1.format)(new Date(todayAppointment.appointmentDate), 'dd/MM/yyyy');
                return (0, languages_1.translate)('queueStatus', lang, statusMessage, dateFormatted, todayAppointment.appointmentTime, visitTypeLabel);
            default:
                return (0, languages_1.translate)('invalidOption', lang);
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
        const lang = state.language || languages_1.Language.ENGLISH;
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
            return (0, languages_1.translate)('provideLMP', lang);
        }
        else if (state.step === 'pregnancy_followup_name') {
            state.step = 'pregnancy_followup_lmp';
            return (0, languages_1.translate)('provideLMP', lang);
        }
        else if (state.step === 'postpartum_name') {
            state.step = 'postpartum_delivery_type';
            return lang === languages_1.Language.ARABIC
                ? `📋 *متابعة ما بعد الولادة*\n\nما نوع الولادة التي قمت بها؟\n\n1️⃣ ولادة طبيعية\n2️⃣ ولادة قيصرية\n\n*الرد بـ 1 أو 2*`
                : `📋 *Postpartum Follow-up*\n\nWhat type of delivery did you have?\n\n1️⃣ Normal delivery\n2️⃣ C-section\n\n*Reply with 1 or 2*`;
        }
        else {
            state.step = 'select_date';
            return await this.handleDateSelection(chatId, '', state);
        }
    }
    async handleLMPInput(chatId, message, state) {
        const lang = state.language || languages_1.Language.ENGLISH;
        try {
            const lmpDate = (0, date_fns_1.parse)(message.trim(), 'dd/MM/yyyy', new Date());
            if (isNaN(lmpDate.getTime())) {
                return (0, languages_1.translate)('invalidDate', lang);
            }
            state.data.lmpDate = (0, date_fns_1.format)(lmpDate, 'yyyy-MM-dd');
            if (state.step === 'pregnancy_first_visit_lmp') {
                state.step = 'pregnancy_first_visit_previous';
                return (0, languages_1.translate)('firstPregnancy', lang);
            }
            else {
                state.step = 'pregnancy_followup_symptoms';
                return lang === languages_1.Language.ARABIC
                    ? `هل لديك أي أعراض تحذيرية حالية؟\n\n1️⃣ لا أعراض\n2️⃣ نزيف\n3️⃣ قلة حركة الجنين\n4️⃣ ألم شديد\n5️⃣ أعراض أخرى\n\n*الرد برقم*`
                    : `Do you have any current warning symptoms?\n\n1️⃣ No symptoms\n2️⃣ Bleeding\n3️⃣ Reduced fetal movements\n4️⃣ Severe pain\n5️⃣ Other symptoms\n\n*Reply with the number*`;
            }
        }
        catch (error) {
            return (0, languages_1.translate)('invalidDate', lang);
        }
    }
    async handlePostpartumDeliveryType(chatId, message, state) {
        const lang = state.language || languages_1.Language.ENGLISH;
        const selection = message.trim();
        if (selection === '1' || selection.includes('normal')) {
            state.data.visitType = appointment_entity_1.VisitType.POSTPARTUM_NORMAL;
        }
        else if (selection === '2' || selection.includes('c-section') || selection.includes('csection') || selection.includes('caesarean')) {
            state.data.visitType = appointment_entity_1.VisitType.POSTPARTUM_CSECTION;
        }
        state.step = 'select_date';
        return await this.handleDateSelection(chatId, '', state);
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
        const lang = state.language || languages_1.Language.ENGLISH;
        if (message && message.trim()) {
            try {
                const selectedDate = (0, date_fns_1.parse)(message.trim(), 'dd/MM/yyyy', new Date());
                if (isNaN(selectedDate.getTime())) {
                    return (0, languages_1.translate)('invalidDate', lang);
                }
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate < today) {
                    return lang === languages_1.Language.ARABIC
                        ? '❌ لا يمكن حجز مواعيد في الماضي. الرجاء اختيار تاريخ في المستقبل.'
                        : '❌ Cannot book appointments in the past. Please select a future date.';
                }
                state.data.appointmentDate = (0, date_fns_1.format)(selectedDate, 'yyyy-MM-dd');
                state.step = 'select_time';
                return await this.handleTimeSelection(chatId, '', state);
            }
            catch (error) {
                return (0, languages_1.translate)('invalidDate', lang);
            }
        }
        const availableDates = await this.appointmentsService.getAvailableDates();
        const dateOptions = availableDates.slice(0, 7).map((date, index) => {
            return `${index + 1}️⃣ ${(0, date_fns_1.format)(date, 'dd/MM/yyyy (EEEE)')}`;
        }).join('\n');
        return (0, languages_1.translate)('selectDate', lang, dateOptions);
    }
    async handleTimeSelection(chatId, message, state) {
        const lang = state.language || languages_1.Language.ENGLISH;
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
                return lang === languages_1.Language.ARABIC
                    ? '❌ اختيار غير صحيح. الرجاء اختيار رقم من القائمة.'
                    : '❌ Invalid selection. Please choose a number from the list.';
            }
        }
        else if (message.trim()) {
            const timeMatch = message.match(/\d{1,2}:\d{2}/)?.[0];
            if (timeMatch) {
                selectedTime = timeMatch.padStart(5, '0');
            }
            else {
                return lang === languages_1.Language.ARABIC
                    ? '❌ تنسيق وقت غير صحيح. الرجاء إدخال الوقت بتنسيق س:د (مثال: 09:00) أو اختيار رقم.'
                    : '❌ Invalid time format. Please provide time in HH:MM format or select a number.';
            }
        }
        else {
            const slots = await this.appointmentsService.getAvailableTimeSlots(state.data.appointmentDate);
            if (slots.length === 0) {
                return (0, languages_1.translate)('noTimeSlots', lang);
            }
            const timeOptions = slots.slice(0, 10).map((slot, index) => {
                return `${index + 1}️⃣ ${slot}`;
            }).join('\n');
            return (0, languages_1.translate)('selectTime', lang, timeOptions);
        }
        state.data.appointmentTime = selectedTime;
        state.step = 'confirm_booking';
        const dateFormatted = (0, date_fns_1.format)((0, date_fns_1.parse)(state.data.appointmentDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy (EEEE)');
        const visitTypeLabel = this.getVisitTypeDisplay(state.data.visitType || appointment_entity_1.VisitType.GENERAL_GYNE, lang);
        return (0, languages_1.translate)('appointmentSummary', lang, visitTypeLabel, dateFormatted, selectedTime);
    }
    async handleBookingConfirmation(chatId, message, state) {
        const lang = state.language || languages_1.Language.ENGLISH;
        if (!message.includes('1') && !message.includes('yes') && !message.includes('confirm') && !message.includes('نعم')) {
            this.conversations.delete(chatId);
            return (0, languages_1.translate)('bookingCancelled', lang);
        }
        let patient = await this.findPatientByChatId(chatId);
        if (!patient && !state.data.patientId) {
            return lang === languages_1.Language.ARABIC
                ? '❌ معلومات المريض مفقودة. الرجاء البدء من جديد.'
                : '❌ Patient information missing. Please start over.';
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
        const visitTypeLabel = this.getVisitTypeDisplay(appointment.visitType, lang);
        return (0, languages_1.translate)('appointmentConfirmed', lang, visitTypeLabel, dateFormatted, appointment.appointmentTime, appointment.queueNumber?.toString() || 'TBD');
    }
    getVisitTypeDisplay(visitType, lang = languages_1.Language.ENGLISH) {
        const keyMap = {
            [appointment_entity_1.VisitType.PREGNANCY_FIRST_VISIT]: 'visitTypePregnancyFirst',
            [appointment_entity_1.VisitType.PREGNANCY_FOLLOWUP]: 'visitTypePregnancyFollowup',
            [appointment_entity_1.VisitType.ULTRASOUND]: 'visitTypeUltrasound',
            [appointment_entity_1.VisitType.POSTPARTUM_NORMAL]: 'visitTypePostpartumNormal',
            [appointment_entity_1.VisitType.POSTPARTUM_CSECTION]: 'visitTypePostpartumCsection',
            [appointment_entity_1.VisitType.FAMILY_PLANNING]: 'visitTypeFamilyPlanning',
            [appointment_entity_1.VisitType.INFERTILITY]: 'visitTypeInfertility',
            [appointment_entity_1.VisitType.GENERAL_GYNE]: 'visitTypeGeneralGyne',
            [appointment_entity_1.VisitType.PAP_SMEAR]: 'visitTypePapSmear',
            [appointment_entity_1.VisitType.EMERGENCY]: 'visitTypeEmergency',
        };
        const key = keyMap[visitType];
        return key ? (0, languages_1.translate)(key, lang) : visitType;
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