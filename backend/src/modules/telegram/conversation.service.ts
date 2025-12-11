import { Injectable } from '@nestjs/common';
import { PatientsService } from '../patients/patients.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { QueueService } from '../queue/queue.service';
import { VisitType, AppointmentStatus, AppointmentSource } from '../../entities/appointment.entity';
import { format, addDays, parse, differenceInWeeks, addWeeks } from 'date-fns';
import { Language, translate } from './languages';

interface ConversationState {
  chatId: string; // Telegram chat ID as string
  step: string;
  data: Record<string, any>;
  lastActivity: Date;
  language: Language; // User's preferred language
}

@Injectable()
export class ConversationService {
  private conversations: Map<string, ConversationState> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor(
    private patientsService: PatientsService,
    private appointmentsService: AppointmentsService,
    private notificationsService: NotificationsService,
    private queueService: QueueService,
  ) {}

  async processMessage(
    chatId: string,
    message: string,
    username?: string,
  ): Promise<string | null> {
    // Clean up expired sessions
    this.cleanupExpiredSessions();

    const normalizedMessage = message.trim().toLowerCase();
    const state = this.getOrCreateState(chatId);

    // Reset if user sends menu keywords or greetings (for first-time users)
    if (this.isMenuKeyword(normalizedMessage) || this.isGreeting(normalizedMessage)) {
      // If language is already set, go to menu. Otherwise, ask for language
      if (state.language) {
        state.step = 'menu';
        state.data = {};
        return this.getMainMenu(state.language);
      } else {
        state.step = 'select_language';
        return this.getLanguageSelection();
      }
    }

    // Handle different conversation steps
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
        // If user sends something unexpected, show menu (if language is set)
        if (state.language) {
          state.step = 'menu';
          return this.getMainMenu(state.language);
        } else {
          state.step = 'select_language';
          return this.getLanguageSelection();
        }
    }
  }

  private getLanguageSelection(): string {
    return translate('welcome', Language.ENGLISH) + '\n\n' + translate('selectLanguage', Language.ENGLISH);
  }

  private async handleLanguageSelection(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    const selection = message.trim();
    
    if (selection === '1' || selection.includes('english') || selection.includes('انجليزي')) {
      state.language = Language.ENGLISH;
      state.step = 'menu';
      return this.getMainMenu(Language.ENGLISH);
    } else if (selection === '2' || selection.includes('arabic') || selection.includes('عربي') || selection.includes('العربية')) {
      state.language = Language.ARABIC;
      state.step = 'menu';
      return this.getMainMenu(Language.ARABIC);
    } else {
      // Invalid selection, ask again
      return translate('welcome', Language.ENGLISH) + '\n\n' + translate('selectLanguage', Language.ENGLISH);
    }
  }

  private getMainMenu(lang: Language): string {
    return translate('menu', lang);
  }

  private getOrCreateState(chatId: string): ConversationState {
    if (!this.conversations.has(chatId)) {
      this.conversations.set(chatId, {
        chatId,
        step: 'select_language', // Start with language selection
        data: {},
        lastActivity: new Date(),
        language: Language.ENGLISH, // Default to English, but will ask user
      });
    }
    const state = this.conversations.get(chatId)!;
    state.lastActivity = new Date();
    
    // If no language is set, go to language selection
    if (!state.language) {
      state.step = 'select_language';
    }
    
    return state;
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [chatId, state] of this.conversations.entries()) {
      if (now.getTime() - state.lastActivity.getTime() > this.SESSION_TIMEOUT) {
        this.conversations.delete(chatId);
      }
    }
  }

  private isMenuKeyword(message: string): boolean {
    const keywords = ['menu', 'start', 'begin', 'help', 'options', 'main', '/start', '/menu'];
    return keywords.some((keyword) => message.includes(keyword));
  }

  private isGreeting(message: string): boolean {
    // If user is at menu step and sends a greeting, show menu
    const greetings = ['hi', 'hello', 'hey', 'hii', 'hi there', 'good morning', 'good afternoon', 'good evening', 'salam', 'السلام عليكم'];
    return greetings.some((greeting) => message === greeting || message.startsWith(greeting + ' '));
  }

  private async handleMenuSelection(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    const selection = message.trim();
    const lang = state.language || Language.ENGLISH;

    switch (selection) {
      case '1':
        state.step = 'pregnancy_first_visit_name';
        return translate('bookPregnancyVisit', lang);

      case '2':
        state.step = 'ultrasound_name';
        state.data.visitType = VisitType.ULTRASOUND;
        return translate('provideFullName', lang);

      case '3':
        state.step = 'postpartum_name';
        // Will ask for delivery type in handleNameInput
        return translate('provideFullName', lang);

      case '4':
        state.step = 'family_planning_name';
        state.data.visitType = VisitType.FAMILY_PLANNING;
        return translate('provideFullName', lang);

      case '5':
        state.step = 'infertility_name';
        state.data.visitType = VisitType.INFERTILITY;
        return translate('provideFullName', lang);

      case '6':
        state.step = 'general_gyne_name';
        state.data.visitType = VisitType.GENERAL_GYNE;
        return translate('provideFullName', lang);

      case '7':
        state.step = 'pap_smear_name';
        state.data.visitType = VisitType.PAP_SMEAR;
        return translate('provideFullName', lang);

      case '8':
        state.step = 'emergency_symptom';
        state.data.emergencyFlag = true;
        state.data.visitType = VisitType.EMERGENCY;
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
        // Check queue
        const patient = await this.findPatientByChatId(chatId);
        if (!patient) {
          return translate('patientNotFound', lang);
        }
        
        // Find today's appointment for this patient
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayAppointments = await this.appointmentsService.findByDate(today);
        const todayAppointment = todayAppointments.find(
          (apt) => apt.patientId === patient.id && 
          apt.status !== AppointmentStatus.CANCELLED &&
          apt.status !== AppointmentStatus.FINISHED &&
          apt.status !== AppointmentStatus.NO_SHOW
        );
        
        if (!todayAppointment) {
          return translate('noAppointmentToday', lang);
        }
        
        // Get queue position
        const queuePosition = await this.queueService.getQueuePosition(patient.id);
        const estimatedWaitTime = queuePosition 
          ? await this.queueService.getEstimatedWaitTime(queuePosition)
          : null;
        
        let statusMessage = '';
        switch (todayAppointment.status) {
          case AppointmentStatus.WITH_DOCTOR:
            statusMessage = lang === Language.ARABIC ? '✅ أنت حالياً مع الطبيب.' : '✅ You are currently with the doctor.';
            break;
          case AppointmentStatus.ARRIVED:
            statusMessage = lang === Language.ARABIC 
              ? `🟢 لقد وصلت. موقعك في الطابور: ${queuePosition || 'غير متوفر'}`
              : `🟢 You have arrived. Queue position: ${queuePosition || 'N/A'}`;
            if (estimatedWaitTime !== null && queuePosition) {
              statusMessage += lang === Language.ARABIC
                ? `\n⏱️ وقت الانتظار المتوقع: ${estimatedWaitTime} دقيقة`
                : `\n⏱️ Estimated wait time: ${estimatedWaitTime} minutes`;
            }
            break;
          case AppointmentStatus.CONFIRMED:
          case AppointmentStatus.BOOKED:
            if (lang === Language.ARABIC) {
              statusMessage = `📋 تم تأكيد موعدك.\n`;
              statusMessage += `⏰ الوقت: ${todayAppointment.appointmentTime}\n`;
              statusMessage += `📝 رقم الدور: ${todayAppointment.queueNumber || 'سيتم تعيينه'}`;
              if (queuePosition) {
                statusMessage += `\n📍 موقعك الحالي في الطابور: ${queuePosition}`;
                if (estimatedWaitTime !== null) {
                  statusMessage += `\n⏱️ وقت الانتظار المتوقع: ${estimatedWaitTime} دقيقة`;
                }
              }
            } else {
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
            statusMessage = lang === Language.ARABIC 
              ? `حالة موعدك: ${todayAppointment.status}`
              : `Your appointment status: ${todayAppointment.status}`;
        }
        
        const visitTypeLabel = this.getVisitTypeDisplay(todayAppointment.visitType, lang);
        const dateFormatted = format(new Date(todayAppointment.appointmentDate as any), 'dd/MM/yyyy');
        
        return translate('queueStatus', lang, 
          statusMessage,
          dateFormatted,
          todayAppointment.appointmentTime,
          visitTypeLabel
        );

      default:
        return translate('invalidOption', lang);
    }
  }

  private async findPatientByChatId(chatId: string) {
    // Try to find patient by Telegram chat ID
    const chatIdNum = parseInt(chatId);
    if (isNaN(chatIdNum)) {
      return null;
    }
    return await this.patientsService.findByTelegramChatId(chatIdNum);
  }

  private async handleNameInput(
    chatId: string,
    message: string,
    state: ConversationState,
    username?: string,
  ): Promise<string> {
    const lang = state.language || Language.ENGLISH;
    state.data.fullName = message.trim();
    
    // Check if patient exists by Telegram chat ID
    let patient = await this.findPatientByChatId(chatId);
    
    if (!patient) {
      // Create new patient with Telegram info
      patient = await this.patientsService.create({
        fullName: state.data.fullName,
        phoneNumber: `telegram_${chatId}`, // Temporary phone number format
        isReturningPatient: false,
        telegramChatId: parseInt(chatId),
        telegramUsername: username,
      });
    } else {
      // Update patient info if needed
      if (patient.fullName !== state.data.fullName || 
          (username && patient.telegramUsername !== username)) {
        await this.patientsService.update(patient.id, {
          fullName: state.data.fullName,
          telegramUsername: username,
        });
      }
    }

    state.data.patientId = patient.id;

    // Continue based on visit type
    if (state.step === 'pregnancy_first_visit_name') {
      state.step = 'pregnancy_first_visit_lmp';
      return translate('provideLMP', lang);
    } else if (state.step === 'pregnancy_followup_name') {
      state.step = 'pregnancy_followup_lmp';
      return translate('provideLMP', lang);
    } else if (state.step === 'postpartum_name') {
      // For postpartum, ask delivery type after name
      state.step = 'postpartum_delivery_type';
      return lang === Language.ARABIC
        ? `📋 *متابعة ما بعد الولادة*\n\nما نوع الولادة التي قمت بها؟\n\n1️⃣ ولادة طبيعية\n2️⃣ ولادة قيصرية\n\n*الرد بـ 1 أو 2*`
        : `📋 *Postpartum Follow-up*\n\nWhat type of delivery did you have?\n\n1️⃣ Normal delivery\n2️⃣ C-section\n\n*Reply with 1 or 2*`;
    } else {
      // For other visit types, proceed to date selection
      state.step = 'select_date';
      return await this.handleDateSelection(chatId, '', state);
    }
  }

  private async handleLMPInput(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    const lang = state.language || Language.ENGLISH;
    try {
      const lmpDate = parse(message.trim(), 'dd/MM/yyyy', new Date());
      if (isNaN(lmpDate.getTime())) {
        return translate('invalidDate', lang);
      }

      state.data.lmpDate = format(lmpDate, 'yyyy-MM-dd');

      if (state.step === 'pregnancy_first_visit_lmp') {
        state.step = 'pregnancy_first_visit_previous';
        return translate('firstPregnancy', lang);
      } else {
        state.step = 'pregnancy_followup_symptoms';
        // Symptoms question - add to translations if needed, for now use simple text
        return lang === Language.ARABIC
          ? `هل لديك أي أعراض تحذيرية حالية؟\n\n1️⃣ لا أعراض\n2️⃣ نزيف\n3️⃣ قلة حركة الجنين\n4️⃣ ألم شديد\n5️⃣ أعراض أخرى\n\n*الرد برقم*`
          : `Do you have any current warning symptoms?\n\n1️⃣ No symptoms\n2️⃣ Bleeding\n3️⃣ Reduced fetal movements\n4️⃣ Severe pain\n5️⃣ Other symptoms\n\n*Reply with the number*`;
      }
    } catch (error) {
      return translate('invalidDate', lang);
    }
  }

  private async handlePostpartumDeliveryType(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    const lang = state.language || Language.ENGLISH;
    const selection = message.trim();
    
    if (selection === '1' || selection.includes('normal')) {
      state.data.visitType = VisitType.POSTPARTUM_NORMAL;
    } else if (selection === '2' || selection.includes('c-section') || selection.includes('csection') || selection.includes('caesarean')) {
      state.data.visitType = VisitType.POSTPARTUM_CSECTION;
    }
    
    state.step = 'select_date';
    return await this.handleDateSelection(chatId, '', state);
  }

  private async handlePreviousPregnancy(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    if (message.includes('1') || message.includes('yes') || message.includes('first')) {
      state.data.firstPregnancy = true;
    } else {
      state.data.firstPregnancy = false;
    }

    state.step = 'select_date';
    return await this.handleDateSelection(chatId, '', state);
  }

  private async handlePregnancySymptoms(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    // Store symptoms in booking data
    state.data.symptoms = message;
    state.step = 'select_date';
    return await this.handleDateSelection(chatId, '', state);
  }

  private async handleLastDelivery(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    // Parse delivery date
    try {
      const deliveryDate = parse(message.trim(), 'dd/MM/yyyy', new Date());
      if (!isNaN(deliveryDate.getTime())) {
        state.data.lastDeliveryDate = format(deliveryDate, 'yyyy-MM-dd');
      }
    } catch (error) {
      // Continue anyway
    }

    state.step = 'family_planning_breastfeeding';
    return `Are you currently breastfeeding?

1️⃣ Yes
2️⃣ No

*Reply with 1 or 2*`;
  }

  private async handleBreastfeeding(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    state.data.breastfeeding = message.includes('1') || message.includes('yes');
    state.step = 'select_date';
    return await this.handleDateSelection(chatId, '', state);
  }

  private async handleInfertilityDuration(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    state.data.infertilityDuration = message;
    state.step = 'select_date';
    return await this.handleDateSelection(chatId, '', state);
  }

  private async handleEmergencySymptom(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
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

  private async handleEmergencyWhen(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    state.data.emergencyWhen = message;
    state.step = 'emergency_pregnant';
    return `Are you currently pregnant?

1️⃣ Yes
2️⃣ No

*Reply with 1 or 2*`;
  }

  private async handleEmergencyPregnant(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    const isPregnant = message.includes('1') || message.includes('yes');
    state.data.emergencyPregnant = isPregnant;

    if (isPregnant) {
      return `How many weeks pregnant are you? (if you know)

*Reply with number of weeks, or "I don't know"*`;
    }

    // For emergency, try to book immediately for today
    const today = format(new Date(), 'yyyy-MM-dd');
    const availableSlots = await this.appointmentsService.getAvailableTimeSlots(today);
    
    if (availableSlots.length === 0) {
      return `🚨 *EMERGENCY CASE REGISTERED*

Your case has been marked as urgent. Please come to the clinic immediately and inform the reception that you are an emergency case.

*If this is a life-threatening emergency, please go to the nearest hospital emergency department immediately.*`;
    }

    // Use first available slot
    state.data.appointmentDate = today;
    state.data.appointmentTime = availableSlots[0];
    state.step = 'confirm_booking';
    return await this.handleBookingConfirmation(chatId, 'yes', state);
  }

  private async handleDateSelection(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    const lang = state.language || Language.ENGLISH;
    
    if (message && message.trim()) {
      // User provided a date
      try {
        const selectedDate = parse(message.trim(), 'dd/MM/yyyy', new Date());
        if (isNaN(selectedDate.getTime())) {
          return translate('invalidDate', lang);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          return lang === Language.ARABIC
            ? '❌ لا يمكن حجز مواعيد في الماضي. الرجاء اختيار تاريخ في المستقبل.'
            : '❌ Cannot book appointments in the past. Please select a future date.';
        }

        state.data.appointmentDate = format(selectedDate, 'yyyy-MM-dd');
        state.step = 'select_time';
        return await this.handleTimeSelection(chatId, '', state);
      } catch (error) {
        return translate('invalidDate', lang);
      }
    }

    // Show available dates
    const availableDates = await this.appointmentsService.getAvailableDates();
    const dateOptions = availableDates.slice(0, 7).map((date, index) => {
      return `${index + 1}️⃣ ${format(date, 'dd/MM/yyyy (EEEE)')}`;
    }).join('\n');

    return translate('selectDate', lang, dateOptions);
  }

  private async handleTimeSelection(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    const lang = state.language || Language.ENGLISH;
    
    if (!state.data.appointmentDate) {
      state.step = 'select_date';
      return await this.handleDateSelection(chatId, '', state);
    }

    let selectedTime: string;

    // Check if it's a number selection
    const numberMatch = message.match(/^\d+/)?.[0];
    if (numberMatch) {
      const slots = await this.appointmentsService.getAvailableTimeSlots(
        state.data.appointmentDate,
      );
      const index = parseInt(numberMatch) - 1;
      if (index >= 0 && index < slots.length) {
        selectedTime = slots[index];
      } else {
        return lang === Language.ARABIC
          ? '❌ اختيار غير صحيح. الرجاء اختيار رقم من القائمة.'
          : '❌ Invalid selection. Please choose a number from the list.';
      }
    } else if (message.trim()) {
      // Try parsing as time
      const timeMatch = message.match(/\d{1,2}:\d{2}/)?.[0];
      if (timeMatch) {
        selectedTime = timeMatch.padStart(5, '0');
      } else {
        return lang === Language.ARABIC
          ? '❌ تنسيق وقت غير صحيح. الرجاء إدخال الوقت بتنسيق س:د (مثال: 09:00) أو اختيار رقم.'
          : '❌ Invalid time format. Please provide time in HH:MM format or select a number.';
      }
    } else {
      // Show available slots
      const slots = await this.appointmentsService.getAvailableTimeSlots(
        state.data.appointmentDate,
      );

      if (slots.length === 0) {
        return translate('noTimeSlots', lang);
      }

      const timeOptions = slots.slice(0, 10).map((slot, index) => {
        return `${index + 1}️⃣ ${slot}`;
      }).join('\n');

      return translate('selectTime', lang, timeOptions);
    }

    state.data.appointmentTime = selectedTime;
    state.step = 'confirm_booking';

    const dateFormatted = format(
      parse(state.data.appointmentDate, 'yyyy-MM-dd', new Date()),
      'dd/MM/yyyy (EEEE)',
    );

    const visitTypeLabel = this.getVisitTypeDisplay(state.data.visitType || VisitType.GENERAL_GYNE, lang);
    return translate('appointmentSummary', lang, visitTypeLabel, dateFormatted, selectedTime);
  }

  private async handleBookingConfirmation(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    const lang = state.language || Language.ENGLISH;
    
    if (!message.includes('1') && !message.includes('yes') && !message.includes('confirm') && !message.includes('نعم')) {
      this.conversations.delete(chatId);
      return translate('bookingCancelled', lang);
    }

    // Get or create patient
    let patient = await this.findPatientByChatId(chatId);
    if (!patient && !state.data.patientId) {
      return lang === Language.ARABIC
        ? '❌ معلومات المريض مفقودة. الرجاء البدء من جديد.'
        : '❌ Patient information missing. Please start over.';
    }

    if (!patient) {
      patient = await this.patientsService.findOne(state.data.patientId);
    }

    // Create appointment
    const appointment = await this.appointmentsService.create({
      patientId: patient.id,
      visitType: state.data.visitType || VisitType.GENERAL_GYNE,
      appointmentDate: state.data.appointmentDate,
      appointmentTime: state.data.appointmentTime,
      emergencyFlag: state.data.emergencyFlag || false,
      source: AppointmentSource.TELEGRAM,
      bookingData: state.data,
      notes: this.buildAppointmentNotes(state),
    });

    // Send booking confirmation notification
    await this.notificationsService.sendBookingConfirmation(appointment.id);

    // Clear conversation state
    this.conversations.delete(chatId);

    const dateFormatted = format(
      parse(appointment.appointmentDate as any, 'yyyy-MM-dd', new Date()),
      'dd/MM/yyyy',
    );

    const visitTypeLabel = this.getVisitTypeDisplay(appointment.visitType, lang);
    return translate('appointmentConfirmed', lang, 
      visitTypeLabel,
      dateFormatted,
      appointment.appointmentTime,
      appointment.queueNumber?.toString() || 'TBD'
    );
  }

  private getVisitTypeDisplay(visitType: VisitType | string, lang: Language = Language.ENGLISH): string {
    const keyMap: Record<string, string> = {
      [VisitType.PREGNANCY_FIRST_VISIT]: 'visitTypePregnancyFirst',
      [VisitType.PREGNANCY_FOLLOWUP]: 'visitTypePregnancyFollowup',
      [VisitType.ULTRASOUND]: 'visitTypeUltrasound',
      [VisitType.POSTPARTUM_NORMAL]: 'visitTypePostpartumNormal',
      [VisitType.POSTPARTUM_CSECTION]: 'visitTypePostpartumCsection',
      [VisitType.FAMILY_PLANNING]: 'visitTypeFamilyPlanning',
      [VisitType.INFERTILITY]: 'visitTypeInfertility',
      [VisitType.GENERAL_GYNE]: 'visitTypeGeneralGyne',
      [VisitType.PAP_SMEAR]: 'visitTypePapSmear',
      [VisitType.EMERGENCY]: 'visitTypeEmergency',
    };
    const key = keyMap[visitType];
    return key ? translate(key, lang) : visitType;
  }

  private buildAppointmentNotes(state: ConversationState): string {
    const notes: string[] = [];
    
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
}

