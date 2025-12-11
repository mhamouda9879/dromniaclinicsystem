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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueController = void 0;
const common_1 = require("@nestjs/common");
const queue_service_1 = require("./queue.service");
let QueueController = class QueueController {
    constructor(queueService) {
        this.queueService = queueService;
    }
    getTodayQueue() {
        return this.queueService.getTodayQueue();
    }
    getCurrentPatient() {
        return this.queueService.getCurrentPatient();
    }
    getNextPatient() {
        return this.queueService.getNextPatient();
    }
    getQueuePosition(patientId) {
        return this.queueService.getQueuePosition(patientId);
    }
    getWaitingRoomDisplay() {
        return this.queueService.getWaitingRoomDisplay();
    }
    markAsArrived(id) {
        return this.queueService.markAsArrived(id);
    }
    startConsultation(id) {
        return this.queueService.startConsultation(id);
    }
    finishConsultation(id) {
        return this.queueService.finishConsultation(id);
    }
    reorderQueue(id, queueNumber) {
        return this.queueService.reorderQueue(id, queueNumber);
    }
};
exports.QueueController = QueueController;
__decorate([
    (0, common_1.Get)('today'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "getTodayQueue", null);
__decorate([
    (0, common_1.Get)('current'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "getCurrentPatient", null);
__decorate([
    (0, common_1.Get)('next'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "getNextPatient", null);
__decorate([
    (0, common_1.Get)('position/:patientId'),
    __param(0, (0, common_1.Param)('patientId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "getQueuePosition", null);
__decorate([
    (0, common_1.Get)('waiting-room'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "getWaitingRoomDisplay", null);
__decorate([
    (0, common_1.Patch)(':id/arrived'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "markAsArrived", null);
__decorate([
    (0, common_1.Patch)(':id/start'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "startConsultation", null);
__decorate([
    (0, common_1.Patch)(':id/finish'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "finishConsultation", null);
__decorate([
    (0, common_1.Patch)(':id/reorder'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('queueNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "reorderQueue", null);
exports.QueueController = QueueController = __decorate([
    (0, common_1.Controller)('queue'),
    __metadata("design:paramtypes", [queue_service_1.QueueService])
], QueueController);
//# sourceMappingURL=queue.controller.js.map