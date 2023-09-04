import { IBaseModel } from "./abstract/ibaseModel.interface";
export class ReportPayablesAndReceivablesByCustomer implements IBaseModel {
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
    totalBefore:number;
    totalPrice:number;
    totalPricePaid:number;
    totalCOD:number;
    totalCODPaid:number;
    totalAfter:number;
}