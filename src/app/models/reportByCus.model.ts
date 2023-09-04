import { IBaseModel } from './abstract/ibaseModel.interface';
export class ReportByCus implements IBaseModel {
    id: number;
    senderId: number;
    code: string;
    toProvince: string;
    totalShipment: number;
    totalCOD: number;
    totalInsured: number;
    totalAmount: number;
    totalDVGT: number;
    totalWeight: number;
    totalBox: number;
    totalShipmentDeliveryComplete: number;
    l1: number;
    l2: number;
    l3: number;
    totalShipmentReturn: number;
}