import { VisitsService, CreateVisitDto, UpdateVisitDto } from './visits.service';
export declare class VisitsController {
    private readonly visitsService;
    constructor(visitsService: VisitsService);
    create(createVisitDto: CreateVisitDto): Promise<import("../../entities/visit.entity").Visit>;
    findByAppointment(appointmentId: string): Promise<import("../../entities/visit.entity").Visit>;
    findByPatient(patientId: string): Promise<import("../../entities/visit.entity").Visit[]>;
    findOne(id: string): Promise<import("../../entities/visit.entity").Visit>;
    update(id: string, updateVisitDto: UpdateVisitDto): Promise<import("../../entities/visit.entity").Visit>;
}
