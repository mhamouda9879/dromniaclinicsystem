import { Injectable } from '@nestjs/common';
import { PatientsService } from '../patients/patients.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { QueueService } from '../queue/queue.service';
import { VisitType, AppointmentStatus } from '../../entities/appointment.entity';
import { format, addDays, parse, differenceInWeeks, addWeeks } from 'date-fns';

interface ConversationState {
  phoneNumber: string;
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

  async processMessage(phoneNumber: string, message: string): Promise<string | null> {
    // Clean up expired sessions
    this.cleanupExpiredSessions();

    const normalizedMessage = message.trim().toLowerCase();
    const state = this.getOrCreateState(phoneNumber);

    // Reset if user sends menu keywords
    if (this.isMenuKeyword(normalizedMessage)) {
      state.step = 'menu';
      state.data = {};
      return this.getMainMenu();
    }

    // Handle different conversation steps
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

  private getMainMenu(): string {
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

  private async handleMenuSelection(
    phoneNumber: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    const option = message.match(/^\d+/)?.[0];

    switch (option) {
      case '1':
        // Pregnancy Visit - ask if first visit or follow-up
        state.step = 'pregnancy_visit_type';
        return `Are you booking for:
1️⃣ First pregnancy visit
2️⃣ Pregnancy follow-up

*Reply with 1 or 2*`;

      case '2':
        state.step = 'ultrasound_name';
        state.data.visitType = VisitType.ULTRASOUND;
        return `Please provide your full name:`;

      case '3':
        state.step = 'postpartum_name';
        state.data.visitType = VisitType.POSTPARTUM_NORMAL;
        return `Please provide your full name:`;

      case '4':
        state.step = 'family_planning_name';
        state.data.visitType = VisitType.FAMILY_PLANNING;
        return `Please provide your full name:`;

      case '5':
        state.step = 'infertility_name';
        state.data.visitType = VisitType.INFERTILITY;
        return `Please provide your full name:`;

      case '6':
        state.step = 'general_gyne_name';
        state.data.visitType = VisitType.GENERAL_GYNE;
        return `Please provide your full name:`;

      case '7':
        state.step = 'pap_smear_name';
        state.data.visitType = VisitType.PAP_SMEAR;
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
        // Check queue
        const patient = await this.patientsService.findByPhoneNumber(phoneNumber);
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

  private async handleNameInput(
    phoneNumber: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    state.data.fullName = message.trim();
    
    // Check if patient exists
    let patient = await this.patientsService.findByPhoneNumber(phoneNumber);
    
    if (!patient) {
      // Create new patient
      patient = await this.patientsService.create({
        fullName: state.data.fullName,
        phoneNumber,
        whatsappId: phoneNumber,
        isReturningPatient: false,
      });
    } else {
      // Update name if different
      if (patient.fullName !== state.data.fullName) {
        await this.patientsService.update(patient.id, {
          fullName: state.data.fullName,
        });
      }
    }

    state.data.patientId = patient.id;

    // Continue based on visit type
    const visitType = state.data.visitType;

    if (visitType === VisitType.PREGNANCY_FIRST_VISIT) {
      state.step = 'pregnancy_first_visit_lmp';
      return `What was the date of your Last Menstrual Period (LMP)?
Please provide in format: DD/MM/YYYY
(e.g., 15/03/2024)`;
    }

    if (visitType === VisitType.PREGNANCY_FOLLOWUP) {
      state.step = 'pregnancy_followup_lmp';
      return `What was the date of your Last Menstrual Period (LMP)?
Please provide in format: DD/MM/YYYY`;
    }

    if (visitType === VisitType.FAMILY_PLANNING) {
      state.step = 'family_planning_last_delivery';
      return `When was your last delivery?
Please provide in format: DD/MM/YYYY
(If not applicable, type "none")`;
    }

    if (visitType === VisitType.INFERTILITY) {
      state.step = 'infertility_duration';
      return `How long have you been trying to conceive?
(e.g., "6 months", "1 year", "2 years")`;
    }

    // For other visit types, proceed to date selection
    state.step = 'select_date';
    return await this.getAvailableDatesMessage();
  }

  private async handleLMPInput(
    phoneNumber: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    try {
      const lmpDate = parse(message.trim(), 'dd/MM/yyyy', new Date());
      state.data.lmpDate = lmpDate.toISOString();
      
      const weeks = differenceInWeeks(new Date(), lmpDate);
      
      if (state.data.visitType === VisitType.PREGNANCY_FIRST_VISIT) {
        state.step = 'pregnancy_first_visit_previous';
        return `Is this your first pregnancy?
1️⃣ Yes, first pregnancy
2️⃣ No, I've been pregnant before

*Reply with 1 or 2*`;
      }

      if (state.data.visitType === VisitType.PREGNANCY_FOLLOWUP) {
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
    } catch (error) {
      return `❌ Invalid date format. Please provide in DD/MM/YYYY format.
Example: 15/03/2024`;
    }
  }

  private async handlePreviousPregnancy(
    phoneNumber: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    if (message.includes('1') || message.includes('yes') || message.includes('first')) {
      state.data.isFirstPregnancy = true;
    } else {
      state.data.isFirstPregnancy = false;
    }
    
    state.step = 'select_date';
    return await this.getAvailableDatesMessage();
  }

  private async handlePregnancySymptoms(
    phoneNumber: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    // Store symptoms
    state.data.symptoms = message;
    
    // Check for emergency symptoms
    if (message.includes('2') || message.includes('3') || message.includes('4')) {
      state.data.emergencyFlag = true;
    }

    state.step = 'select_date';
    return await this.getAvailableDatesMessage();
  }

  private async handleLastDelivery(
    phoneNumber: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    if (message.toLowerCase().includes('none') || message.toLowerCase().includes('n/a')) {
      state.step = 'select_date';
      return await this.getAvailableDatesMessage();
    }

    try {
      const deliveryDate = parse(message.trim(), 'dd/MM/yyyy', new Date());
      state.data.lastDeliveryDate = deliveryDate.toISOString();
      
      state.step = 'family_planning_delivery_type';
      return `What was the type of delivery?
1️⃣ Normal delivery
2️⃣ C-section

*Reply with 1 or 2*`;
    } catch (error) {
      return `❌ Invalid date format. Please provide in DD/MM/YYYY format or type "none".`;
    }
  }

  private async handleBreastfeeding(
    phoneNumber: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    if (message.includes('1') || message.includes('yes')) {
      state.data.isBreastfeeding = true;
    } else {
      state.data.isBreastfeeding = false;
    }

    state.step = 'select_date';
    return await this.getAvailableDatesMessage();
  }

  private async handleInfertilityDuration(
    phoneNumber: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    state.data.infertilityDuration = message;

    state.step = 'select_date';
    return await this.getAvailableDatesMessage();
  }

  private async handleEmergencySymptom(
    phoneNumber: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    state.data.emergencySymptom = message;
    state.step = 'emergency_when';
    
    return `When did this symptom start?
Please provide approximate time (e.g., "2 hours ago", "this morning", "30 minutes ago")`;
  }

  private async handleEmergencyWhen(
    phoneNumber: string,
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
    phoneNumber: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    const isPregnant = message.includes('1') || message.includes('yes');
    state.data.isPregnant = isPregnant;

    if (isPregnant) {
      state.step = 'emergency_weeks';
      return `How many weeks pregnant are you?
(If you don't know, type "unknown")`;
    } else {
      // Proceed with emergency booking
      return await this.createEmergencyAppointment(phoneNumber, state);
    }
  }

  private async createEmergencyAppointment(
    phoneNumber: string,
    state: ConversationState,
  ): Promise<string> {
    // Get or create patient
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

    // Create emergency appointment for today/tomorrow
    const today = new Date();
    const appointmentDate = format(today, 'yyyy-MM-dd');
    const availableSlots = await this.appointmentsService.getAvailableTimeSlots(appointmentDate);
    
    let appointmentTime = availableSlots[0] || '09:00';
    
    // If no slots today, try tomorrow
    if (availableSlots.length === 0) {
      const tomorrow = addDays(today, 1);
      const tomorrowDate = format(tomorrow, 'yyyy-MM-dd');
      const tomorrowSlots = await this.appointmentsService.getAvailableTimeSlots(tomorrowDate);
      if (tomorrowSlots.length > 0) {
        appointmentTime = tomorrowSlots[0];
      }
    }

    const appointment = await this.appointmentsService.create({
      patientId: patient.id,
      visitType: VisitType.EMERGENCY,
      appointmentDate,
      appointmentTime,
      emergencyFlag: true,
      source: 'whatsapp' as any,
      bookingData: state.data,
      notes: `Emergency: ${state.data.emergencySymptom}. Started: ${state.data.emergencyWhen}`,
    });

    // Send emergency instructions
    this.conversations.delete(phoneNumber);
    
    return `🚨 *EMERGENCY APPOINTMENT CONFIRMED*

Your case has been marked as urgent and prioritized.

*Appointment Details:*
📅 Date: ${format(parse(appointmentDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')}
⏰ Time: ${appointmentTime}
📍 Queue: #${appointment.queueNumber}

⚠️ *Please come to the clinic immediately* and inform reception that you are an emergency case.

If the clinic is closed, please go to the nearest hospital emergency department immediately.

*Your safety is our priority.*`;
  }

  private async getAvailableDatesMessage(): Promise<string> {
    const dates = await this.appointmentsService.getAvailableDates();
    const dateOptions = dates.slice(0, 7).map((date, index) => {
      const formatted = format(date, 'dd/MM/yyyy (EEEE)');
      return `${index + 1}️⃣ ${formatted}`;
    }).join('\n');

    return `📅 *Select Appointment Date:*

${dateOptions}

*Reply with the number (1-7) or provide a date in DD/MM/YYYY format*`;
  }

  private async handleDateSelection(
    phoneNumber: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    let selectedDate: Date;

    // Check if it's a number selection
    const numberMatch = message.match(/^\d+/)?.[0];
    if (numberMatch) {
      const dates = await this.appointmentsService.getAvailableDates();
      const index = parseInt(numberMatch) - 1;
      if (index >= 0 && index < dates.length) {
        selectedDate = dates[index];
      } else {
        return `❌ Invalid selection. Please choose a number from the list.`;
      }
    } else {
      // Try parsing as date
      try {
        selectedDate = parse(message.trim(), 'dd/MM/yyyy', new Date());
      } catch {
        return `❌ Invalid date format. Please provide in DD/MM/YYYY format or select a number.`;
      }
    }

    state.data.appointmentDate = format(selectedDate, 'yyyy-MM-dd');
    state.step = 'select_time';

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

  private async handleTimeSelection(
    phoneNumber: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
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
    } else {
      // Try parsing as time
      const timeMatch = message.match(/\d{1,2}:\d{2}/)?.[0];
      if (timeMatch) {
        selectedTime = timeMatch.padStart(5, '0');
      } else {
        return `❌ Invalid time format. Please provide time in HH:MM format or select a number.`;
      }
    }

    state.data.appointmentTime = selectedTime;
    state.step = 'confirm_booking';

    const dateFormatted = format(
      parse(state.data.appointmentDate, 'yyyy-MM-dd', new Date()),
      'dd/MM/yyyy (EEEE)',
    );

    return `✅ *Appointment Summary:*

📋 Visit Type: ${this.getVisitTypeDisplay(state.data.visitType)}
📅 Date: ${dateFormatted}
⏰ Time: ${selectedTime}

*Confirm your appointment?*
1️⃣ Yes, confirm
2️⃣ No, cancel

*Reply with 1 or 2*`;
  }

  private async handleBookingConfirmation(
    phoneNumber: string,
    message: string,
    state: ConversationState,
  ): Promise<string> {
    if (!message.includes('1') && !message.includes('yes') && !message.includes('confirm')) {
      this.conversations.delete(phoneNumber);
      return `Booking cancelled. You can start a new booking anytime by sending any message.`;
    }

    // Get or create patient
    let patient = await this.patientsService.findByPhoneNumber(phoneNumber);
    if (!patient && !state.data.patientId) {
      return `❌ Patient information missing. Please start over.`;
    }

    if (!patient) {
      patient = await this.patientsService.findOne(state.data.patientId);
    }

    // Create appointment
    const appointment = await this.appointmentsService.create({
      patientId: patient.id,
      visitType: state.data.visitType,
      appointmentDate: state.data.appointmentDate,
      appointmentTime: state.data.appointmentTime,
      emergencyFlag: state.data.emergencyFlag || false,
      source: 'whatsapp' as any,
      bookingData: state.data,
      notes: this.buildAppointmentNotes(state),
    });

    // Send booking confirmation notification
    await this.notificationsService.sendBookingConfirmation(appointment.id);

    // Clear conversation state
    this.conversations.delete(phoneNumber);

    const appointmentDateStr = typeof appointment.appointmentDate === 'string' 
      ? appointment.appointmentDate 
      : format(appointment.appointmentDate, 'yyyy-MM-dd');
    const dateFormatted = format(
      parse(appointmentDateStr, 'yyyy-MM-dd', new Date()),
      'dd/MM/yyyy',
    );

    return `✅ *APPOINTMENT CONFIRMED!*

📋 Visit: ${this.getVisitTypeDisplay(appointment.visitType)}
📅 Date: ${dateFormatted}
⏰ Time: ${appointment.appointmentTime}
🔢 Queue Number: #${appointment.queueNumber}

*Please arrive 10-15 minutes before your appointment time.*

You will receive a reminder before your appointment.

Thank you for choosing our clinic! 🙏`;
  }

  private getVisitTypeDisplay(visitType: VisitType): string {
    const displays = {
      [VisitType.PREGNANCY_FIRST_VISIT]: 'First Pregnancy Visit',
      [VisitType.PREGNANCY_FOLLOWUP]: 'Pregnancy Follow-up',
      [VisitType.ULTRASOUND]: 'Ultrasound',
      [VisitType.POSTPARTUM_NORMAL]: 'Postpartum Follow-up (Normal)',
      [VisitType.POSTPARTUM_CSECTION]: 'Postpartum Follow-up (C-section)',
      [VisitType.FAMILY_PLANNING]: 'Family Planning',
      [VisitType.INFERTILITY]: 'Infertility Consultation',
      [VisitType.GENERAL_GYNE]: 'General Gynecology',
      [VisitType.PAP_SMEAR]: 'Pap Smear',
      [VisitType.EMERGENCY]: 'Emergency',
    };
    return displays[visitType] || visitType;
  }

  private buildAppointmentNotes(state: ConversationState): string {
    const notes: string[] = [];
    
    if (state.data.lmpDate) {
      notes.push(`LMP: ${format(parse(state.data.lmpDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')}`);
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

  private getOrCreateState(phoneNumber: string): ConversationState {
    if (!this.conversations.has(phoneNumber)) {
      this.conversations.set(phoneNumber, {
        phoneNumber,
        step: 'menu',
        data: {},
        lastActivity: new Date(),
      });
    }
    const state = this.conversations.get(phoneNumber)!;
    state.lastActivity = new Date();
    return state;
  }

  private isMenuKeyword(message: string): boolean {
    const keywords = ['menu', 'start', 'hi', 'hello', 'help', 'cancel'];
    return keywords.some((keyword) => message.includes(keyword));
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [phoneNumber, state] of this.conversations.entries()) {
      if (now.getTime() - state.lastActivity.getTime() > this.SESSION_TIMEOUT) {
        this.conversations.delete(phoneNumber);
      }
    }
  }
}

