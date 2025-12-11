import { Injectable } from '@nestjs/common';
import { PatientsService } from '../patients/patients.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { QueueService } from '../queue/queue.service';
import { VisitType, AppointmentStatus, AppointmentSource } from '../../entities/appointment.entity';
import { format, addDays, parse, differenceInWeeks, addWeeks } from 'date-fns';

interface ConversationState {
  chatId: string; // Telegram chat ID as string
  step: string;
  data: Record<string, any>;
  lastActivity: Date;
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

    // Reset if user sends menu keywords
    if (this.isMenuKeyword(normalizedMessage)) {
      state.step = 'menu';
      state.data = {};
      return this.getMainMenu();
    }

    // Handle different conversation steps
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

  private getMainMenu(): string {
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

  private getOrCreateState(chatId: string): ConversationState {
    if (!this.conversations.has(chatId)) {
      this.conversations.set(chatId, {
        chatId,
        step: 'menu',
        data: {},
        lastActivity: new Date(),
      });
    }
    const state = this.conversations.get(chatId)!;
    state.lastActivity = new Date();
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
    const keywords = ['menu', 'start', 'begin', 'help', 'options', 'main'];
    return keywords.some((keyword) => message.includes(keyword));
  }

  private async handleMenuSelection(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
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
        state.data.visitType = VisitType.ULTRASOUND;
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
        state.data.visitType = VisitType.FAMILY_PLANNING;
        return `Please provide your full name:

*Reply with your name*`;

      case '5':
        state.step = 'infertility_name';
        state.data.visitType = VisitType.INFERTILITY;
        return `Please provide your full name:

*Reply with your name*`;

      case '6':
        state.step = 'general_gyne_name';
        state.data.visitType = VisitType.GENERAL_GYNE;
        return `Please provide your full name:

*Reply with your name*`;

      case '7':
        state.step = 'pap_smear_name';
        state.data.visitType = VisitType.PAP_SMEAR;
        return `Please provide your full name:

*Reply with your name*`;

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
          return `We couldn't find your information. Please book an appointment first.`;
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
          return `You don't have an appointment scheduled for today. 

To book an appointment, please reply with the number from the main menu.`;
        }
        
        // Get queue position
        const queuePosition = await this.queueService.getQueuePosition(patient.id);
        const estimatedWaitTime = queuePosition 
          ? await this.queueService.getEstimatedWaitTime(queuePosition)
          : null;
        
        let statusMessage = '';
        switch (todayAppointment.status) {
          case AppointmentStatus.WITH_DOCTOR:
            statusMessage = '✅ You are currently with the doctor.';
            break;
          case AppointmentStatus.ARRIVED:
            statusMessage = `🟢 You have arrived. Queue position: ${queuePosition || 'N/A'}`;
            if (estimatedWaitTime !== null && queuePosition) {
              statusMessage += `\n⏱️ Estimated wait time: ${estimatedWaitTime} minutes`;
            }
            break;
          case AppointmentStatus.CONFIRMED:
          case AppointmentStatus.BOOKED:
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
📅 Date: ${format(new Date(todayAppointment.appointmentDate), 'dd/MM/yyyy')}
🕐 Time: ${todayAppointment.appointmentTime}
🏥 Type: ${todayAppointment.visitType}

Reply *MENU* to return to main menu.`;

      default:
        return `❌ Invalid option. Please reply with a number from 1-10.`;
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
      return `Please provide the date of your Last Menstrual Period (LMP).

Format: DD/MM/YYYY (e.g., 15/11/2024)

*Reply with the date*`;
    } else if (state.step === 'pregnancy_followup_name') {
      state.step = 'pregnancy_followup_lmp';
      return `Please provide the date of your Last Menstrual Period (LMP).

Format: DD/MM/YYYY (e.g., 15/11/2024)

*Reply with the date*`;
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
    try {
      const lmpDate = parse(message.trim(), 'dd/MM/yyyy', new Date());
      if (isNaN(lmpDate.getTime())) {
        return `❌ Invalid date format. Please use DD/MM/YYYY format (e.g., 15/11/2024)`;
      }

      state.data.lmpDate = format(lmpDate, 'yyyy-MM-dd');

      if (state.step === 'pregnancy_first_visit_lmp') {
        state.step = 'pregnancy_first_visit_previous';
        return `Is this your first pregnancy?

1️⃣ Yes, first pregnancy
2️⃣ No, I've had previous pregnancies

*Reply with 1 or 2*`;
      } else {
        state.step = 'pregnancy_followup_symptoms';
        return `Do you have any current warning symptoms?

1️⃣ No symptoms
2️⃣ Bleeding
3️⃣ Reduced fetal movements
4️⃣ Severe pain
5️⃣ Other symptoms

*Reply with the number*`;
      }
    } catch (error) {
      return `❌ Invalid date format. Please use DD/MM/YYYY format (e.g., 15/11/2024)`;
    }
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
    if (message && message.trim()) {
      // User provided a date
      try {
        const selectedDate = parse(message.trim(), 'dd/MM/yyyy', new Date());
        if (isNaN(selectedDate.getTime())) {
          return `❌ Invalid date format. Please use DD/MM/YYYY`;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          return `❌ Cannot book appointments in the past. Please select a future date.`;
        }

        state.data.appointmentDate = format(selectedDate, 'yyyy-MM-dd');
        state.step = 'select_time';
        return await this.handleTimeSelection(chatId, '', state);
      } catch (error) {
        return `❌ Invalid date format. Please use DD/MM/YYYY (e.g., 15/12/2024)`;
      }
    }

    // Show available dates
    const availableDates = await this.appointmentsService.getAvailableDates();
    const dateOptions = availableDates.slice(0, 7).map((date, index) => {
      return `${index + 1}️⃣ ${format(date, 'dd/MM/yyyy (EEEE)')}`;
    }).join('\n');

    return `📅 *Select Appointment Date:*

${dateOptions}

*Reply with the number or type the date in DD/MM/YYYY format*`;
  }

  private async handleTimeSelection(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
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
        return `❌ Invalid selection. Please choose a number from the list.`;
      }
    } else if (message.trim()) {
      // Try parsing as time
      const timeMatch = message.match(/\d{1,2}:\d{2}/)?.[0];
      if (timeMatch) {
        selectedTime = timeMatch.padStart(5, '0');
      } else {
        return `❌ Invalid time format. Please provide time in HH:MM format or select a number.`;
      }
    } else {
      // Show available slots
      const slots = await this.appointmentsService.getAvailableTimeSlots(
        state.data.appointmentDate,
      );

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

    const dateFormatted = format(
      parse(state.data.appointmentDate, 'yyyy-MM-dd', new Date()),
      'dd/MM/yyyy (EEEE)',
    );

    return `✅ *Appointment Summary:*

📋 Visit Type: ${this.getVisitTypeDisplay(state.data.visitType || VisitType.GENERAL_GYNE)}
📅 Date: ${dateFormatted}
⏰ Time: ${selectedTime}

*Confirm your appointment?*
1️⃣ Yes, confirm
2️⃣ No, cancel

*Reply with 1 or 2*`;
  }

  private async handleBookingConfirmation(
    chatId: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    if (!message.includes('1') && !message.includes('yes') && !message.includes('confirm')) {
      this.conversations.delete(chatId);
      return `Booking cancelled. You can start a new booking anytime by sending any message.`;
    }

    // Get or create patient
    let patient = await this.findPatientByChatId(chatId);
    if (!patient && !state.data.patientId) {
      return `❌ Patient information missing. Please start over.`;
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

    return `✅ *APPOINTMENT CONFIRMED!*

📋 Visit: ${this.getVisitTypeDisplay(appointment.visitType)}
📅 Date: ${dateFormatted}
⏰ Time: ${appointment.appointmentTime}
🔢 Queue Number: #${appointment.queueNumber}

*Please arrive 10-15 minutes before your appointment time.*

Thank you for choosing our clinic! We look forward to seeing you.

Reply *MENU* to return to main menu.`;
  }

  private getVisitTypeDisplay(visitType: VisitType | string): string {
    const labels: Record<string, string> = {
      [VisitType.PREGNANCY_FIRST_VISIT]: 'Pregnancy First Visit',
      [VisitType.PREGNANCY_FOLLOWUP]: 'Pregnancy Follow-up',
      [VisitType.ULTRASOUND]: 'Ultrasound',
      [VisitType.POSTPARTUM_NORMAL]: 'Postpartum Follow-up (Normal)',
      [VisitType.POSTPARTUM_CSECTION]: 'Postpartum Follow-up (C-section)',
      [VisitType.FAMILY_PLANNING]: 'Family Planning',
      [VisitType.INFERTILITY]: 'Infertility Consultation',
      [VisitType.GENERAL_GYNE]: 'General Gynecology',
      [VisitType.PAP_SMEAR]: 'Pap Smear',
      [VisitType.EMERGENCY]: 'Emergency Visit',
    };
    return labels[visitType] || visitType;
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

