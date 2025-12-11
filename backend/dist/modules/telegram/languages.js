"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translations = exports.Language = void 0;
exports.translate = translate;
var Language;
(function (Language) {
    Language["ENGLISH"] = "en";
    Language["ARABIC"] = "ar";
})(Language || (exports.Language = Language = {}));
exports.translations = {
    [Language.ENGLISH]: {
        welcome: '👋 *Welcome to Dr.Omnia Clinic!*\n\nI am your virtual assistant. I can help you:\n\n• Book appointments\n• Check your queue status\n• Get information about our services\n\n*Please select your preferred language:*',
        selectLanguage: 'Please select your preferred language:\n\n1️⃣ English\n2️⃣ العربية',
        menu: `👋 *Welcome to OB/GYN Clinic!*

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

*Reply with a number (1-10)*`,
        bookPregnancyVisit: `📋 *Book Pregnancy Visit*

Is this your first pregnancy visit or a follow-up?

1️⃣ First visit
2️⃣ Follow-up

*Reply with 1 or 2*`,
        provideFullName: `Please provide your full name:

*Reply with your name*`,
        provideLMP: `Please provide the date of your Last Menstrual Period (LMP).

Format: DD/MM/YYYY (e.g., 15/11/2024)

*Reply with the date*`,
        invalidDate: `❌ Invalid date format. Please use DD/MM/YYYY format (e.g., 15/11/2024)`,
        firstPregnancy: `Is this your first pregnancy?

1️⃣ Yes, first pregnancy
2️⃣ No, I've had previous pregnancies

*Reply with 1 or 2*`,
        selectDate: `📅 *Select Appointment Date:*

{0}

*Reply with the number or type the date in DD/MM/YYYY format*`,
        selectTime: `⏰ *Select Time Slot:*

{0}

*Reply with the number or time (e.g., "09:00")*`,
        noTimeSlots: `❌ No available time slots for this date. Please select another date.`,
        appointmentSummary: `✅ *Appointment Summary:*

📋 Visit Type: {0}
📅 Date: {1}
⏰ Time: {2}

*Confirm your appointment?*
1️⃣ Yes, confirm
2️⃣ No, cancel

*Reply with 1 or 2*`,
        appointmentConfirmed: `✅ *APPOINTMENT CONFIRMED!*

📋 Visit: {0}
📅 Date: {1}
⏰ Time: {2}
🔢 Queue Number: #{3}

*Please arrive 10-15 minutes before your appointment time.*

Thank you for choosing our clinic! We look forward to seeing you.

Reply *MENU* to return to main menu.`,
        bookingCancelled: `Booking cancelled. You can start a new booking anytime by sending any message.`,
        noAppointmentToday: `You don't have an appointment scheduled for today. 

To book an appointment, please reply with the number from the main menu.`,
        queueStatus: `📊 *Your Queue Status*

{0}

*Appointment Details:*
📅 Date: {1}
🕐 Time: {2}
🏥 Type: {3}

Reply *MENU* to return to main menu.`,
        invalidOption: `❌ Invalid option. Please reply with a number from 1-10.`,
        patientNotFound: `We couldn't find your information. Please book an appointment first.`,
        visitTypePregnancyFirst: 'Pregnancy First Visit',
        visitTypePregnancyFollowup: 'Pregnancy Follow-up',
        visitTypeUltrasound: 'Ultrasound',
        visitTypePostpartumNormal: 'Postpartum Follow-up (Normal)',
        visitTypePostpartumCsection: 'Postpartum Follow-up (C-section)',
        visitTypeFamilyPlanning: 'Family Planning',
        visitTypeInfertility: 'Infertility Consultation',
        visitTypeGeneralGyne: 'General Gynecology',
        visitTypePapSmear: 'Pap Smear',
        visitTypeEmergency: 'Emergency Visit',
    },
    [Language.ARABIC]: {
        welcome: '👋 *مرحباً بك في عيادة الدكتورة أمنية!*\n\nأنا مساعدك الافتراضي. يمكنني مساعدتك في:\n\n• حجز المواعيد\n• التحقق من رقم دورك في الطابور\n• الحصول على معلومات حول خدماتنا\n\n*الرجاء اختيار لغتك المفضلة:*',
        selectLanguage: 'الرجاء اختيار لغتك المفضلة:\n\n1️⃣ English\n2️⃣ العربية',
        menu: `👋 *مرحباً بك في عيادة النساء والتوليد!*

الرجاء اختيار خيار بالرد برقم:

1️⃣ حجز زيارة الحمل (الزيارة الأولى / المتابعة)
2️⃣ حجز الموجات فوق الصوتية (الحمل / المهبل)
3️⃣ متابعة ما بعد الولادة
4️⃣ تنظيم الأسرة
5️⃣ العقم / محاولة الإنجاب
6️⃣ مشاكل أمراض النساء العامة
7️⃣ مسحة عنق الرحم / فحص عنق الرحم
8️⃣ حالة طوارئ
9️⃣ تعديل / إلغاء موعد
🔟 التحقق من رقم دوري في الطابور

*الرد برقم (1-10)*`,
        bookPregnancyVisit: `📋 *حجز زيارة الحمل*

هل هذه زيارتك الأولى للحمل أم متابعة؟

1️⃣ الزيارة الأولى
2️⃣ المتابعة

*الرد بـ 1 أو 2*`,
        provideFullName: `الرجاء إدخال اسمك الكامل:

*الرد باسمك*`,
        provideLMP: `الرجاء إدخال تاريخ آخر دورة شهرية (LMP).

التنسيق: يوم/شهر/سنة (مثال: 15/11/2024)

*الرد بالتاريخ*`,
        invalidDate: `❌ تنسيق تاريخ غير صحيح. الرجاء استخدام تنسيق يوم/شهر/سنة (مثال: 15/11/2024)`,
        firstPregnancy: `هل هذا حملك الأول؟

1️⃣ نعم، الحمل الأول
2️⃣ لا، كان لدي حالات حمل سابقة

*الرد بـ 1 أو 2*`,
        selectDate: `📅 *اختر تاريخ الموعد:*

{0}

*الرد برقم أو اكتب التاريخ بتنسيق يوم/شهر/سنة*`,
        selectTime: `⏰ *اختر وقت الموعد:*

{0}

*الرد برقم أو الوقت (مثال: "09:00")*`,
        noTimeSlots: `❌ لا توجد أوقات متاحة لهذا التاريخ. الرجاء اختيار تاريخ آخر.`,
        appointmentSummary: `✅ *ملخص الموعد:*

📋 نوع الزيارة: {0}
📅 التاريخ: {1}
⏰ الوقت: {2}

*تأكيد موعدك؟*
1️⃣ نعم، تأكيد
2️⃣ لا، إلغاء

*الرد بـ 1 أو 2*`,
        appointmentConfirmed: `✅ *تم تأكيد الموعد!*

📋 الزيارة: {0}
📅 التاريخ: {1}
⏰ الوقت: {2}
🔢 رقم الدور: #{3}

*الرجاء الحضور قبل 10-15 دقيقة من موعدك.*

شكراً لاختيارك عيادتنا! نتطلع لرؤيتك.

الرد *MENU* للعودة إلى القائمة الرئيسية.`,
        bookingCancelled: `تم إلغاء الحجز. يمكنك بدء حجز جديد في أي وقت بإرسال أي رسالة.`,
        noAppointmentToday: `ليس لديك موعد محدد لليوم. 

لحجز موعد، الرجاء الرد برقم من القائمة الرئيسية.`,
        queueStatus: `📊 *حالة الطابور الخاصة بك*

{0}

*تفاصيل الموعد:*
📅 التاريخ: {1}
🕐 الوقت: {2}
🏥 النوع: {3}

الرد *MENU* للعودة إلى القائمة الرئيسية.`,
        invalidOption: `❌ خيار غير صحيح. الرجاء الرد برقم من 1-10.`,
        patientNotFound: `لم نتمكن من العثور على معلوماتك. الرجاء حجز موعد أولاً.`,
        visitTypePregnancyFirst: 'زيارة الحمل الأولى',
        visitTypePregnancyFollowup: 'متابعة الحمل',
        visitTypeUltrasound: 'الموجات فوق الصوتية',
        visitTypePostpartumNormal: 'متابعة ما بعد الولادة (طبيعي)',
        visitTypePostpartumCsection: 'متابعة ما بعد الولادة (قيصرية)',
        visitTypeFamilyPlanning: 'تنظيم الأسرة',
        visitTypeInfertility: 'استشارة العقم',
        visitTypeGeneralGyne: 'أمراض النساء العامة',
        visitTypePapSmear: 'مسحة عنق الرحم',
        visitTypeEmergency: 'زيارة طوارئ',
    },
};
function translate(key, lang, ...args) {
    const translation = exports.translations[lang]?.[key] || exports.translations[Language.ENGLISH][key] || key;
    return translation.replace(/\{(\d+)\}/g, (match, index) => {
        return args[parseInt(index)] || match;
    });
}
//# sourceMappingURL=languages.js.map