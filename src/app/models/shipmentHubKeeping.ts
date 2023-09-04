import { IBaseModel } from "./abstract/ibaseModel.interface";
export class ShipmentHubKeeping implements IBaseModel {
    id: number;
    createdWhen: Date;
    shipmentNumber: string;
    shipmentStatusId: number;
    shipmentStatusName: string;
    paymentTypeId: number;
    paymentTypeName: string;
    serviceId: number;
    serviceName: string;
    senderId: number;
    senderName: string;
    senderPhone: string;
    pickingAddress: string;
    weight: number;
    cod: number;
    totalPrice: number;
    codKeeping: number;
    totalPriceKeeping: number;
    tPLNumber : string;
    tPLCode : string;
    receiptCODCreatedWhen: any;
    typePay: string;
    receiptCODCreatedBy: string;
}