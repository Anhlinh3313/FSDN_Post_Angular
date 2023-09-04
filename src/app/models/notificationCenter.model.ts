export class NotificationCenter{
    userId: number;
    hubId: number;
    countNewRequest: number = 0;
    countHandleShipment: number = 0;
    countPrioritize: number = 0;
    countComplain: number = 0;
    countIncidents: number = 0;
    countCompensation: number = 0;
    countWaitngHandling: number = 0;
    countShipmentDelay: number = 0;
    countWaitingAcceptReturn: number = 0;
    countWaitingCreateReturn: number = 0;
    countShipmentIncidents: number = 0;
    countListReceiptMoneyAccept: number = 0;
}