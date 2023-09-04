import { IBaseModel } from "./abstract/ibaseModel.interface";
export class ReportCustomer implements IBaseModel {
    id: number;
    code: string;
    name: string;
    companyName: string;
    address: string;
    phoneNumber: string;
    email: string;
    taxCode: string;
    customerTypeId:number;
    customerTypeName:string;
    totalShipment:number;
    totalShipmentDeliveryComplete:number;
    totalShipmentReturn:number;
    totalCODPaid:number;
    totalCODUnpaid:number;
    totalPricePaid:number;
    totalPriceUnpaid:number;
}