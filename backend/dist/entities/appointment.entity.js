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
exports.Appointment = exports.AppointmentSource = exports.AppointmentStatus = exports.VisitType = void 0;
const typeorm_1 = require("typeorm");
const patient_entity_1 = require("./patient.entity");
const visit_entity_1 = require("./visit.entity");
var VisitType;
(function (VisitType) {
    VisitType["PREGNANCY_FIRST_VISIT"] = "pregnancy_first_visit";
    VisitType["PREGNANCY_FOLLOWUP"] = "pregnancy_followup";
    VisitType["ULTRASOUND"] = "ultrasound";
    VisitType["POSTPARTUM_NORMAL"] = "postpartum_normal";
    VisitType["POSTPARTUM_CSECTION"] = "postpartum_csection";
    VisitType["FAMILY_PLANNING"] = "family_planning";
    VisitType["INFERTILITY"] = "infertility";
    VisitType["GENERAL_GYNE"] = "general_gyne";
    VisitType["PAP_SMEAR"] = "pap_smear";
    VisitType["EMERGENCY"] = "emergency";
})(VisitType || (exports.VisitType = VisitType = {}));
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["BOOKED"] = "booked";
    AppointmentStatus["CONFIRMED"] = "confirmed";
    AppointmentStatus["ARRIVED"] = "arrived";
    AppointmentStatus["WITH_DOCTOR"] = "with_doctor";
    AppointmentStatus["FINISHED"] = "finished";
    AppointmentStatus["NO_SHOW"] = "no_show";
    AppointmentStatus["CANCELLED"] = "cancelled";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
var AppointmentSource;
(function (AppointmentSource) {
    AppointmentSource["WHATSAPP"] = "whatsapp";
    AppointmentSource["TELEGRAM"] = "telegram";
    AppointmentSource["WALK_IN"] = "walk_in";
    AppointmentSource["PHONE"] = "phone";
    AppointmentSource["OTHER"] = "other";
})(AppointmentSource || (exports.AppointmentSource = AppointmentSource = {}));
let Appointment = class Appointment {
};
exports.Appointment = Appointment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Appointment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Appointment.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: VisitType,
    }),
    __metadata("design:type", String)
], Appointment.prototype, "visitType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Appointment.prototype, "appointmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], Appointment.prototype, "appointmentTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Appointment.prototype, "queueNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.BOOKED,
    }),
    __metadata("design:type", String)
], Appointment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Appointment.prototype, "emergencyFlag", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AppointmentSource,
        default: AppointmentSource.TELEGRAM,
    }),
    __metadata("design:type", String)
], Appointment.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Appointment.prototype, "bookingData", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Appointment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Appointment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, (patient) => patient.appointments),
    (0, typeorm_1.JoinColumn)({ name: 'patientId' }),
    __metadata("design:type", patient_entity_1.Patient)
], Appointment.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => visit_entity_1.Visit, (visit) => visit.appointment),
    __metadata("design:type", visit_entity_1.Visit)
], Appointment.prototype, "visit", void 0);
exports.Appointment = Appointment = __decorate([
    (0, typeorm_1.Entity)('appointments'),
    (0, typeorm_1.Index)(['appointmentDate', 'appointmentTime']),
    (0, typeorm_1.Index)(['status', 'appointmentDate'])
], Appointment);
//# sourceMappingURL=appointment.entity.js.map