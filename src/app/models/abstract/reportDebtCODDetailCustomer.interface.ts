import { Shipment } from "..";

export interface ReportDebtCODDetailCustomer extends Shipment {
      id: number;
      code: string;
      name: string;
      customerTypeId:number;
      totalPrice:number;
      totalPricePaid:number;
      totalPriceNotPaid:number;
      totalCOD:number;
      totalCODPaid:number;
      totalCODNotPaid:number;
      totalCODCharged:number; // đã thu
      totalCODNotCharged:number; // chưa thu
      totalCODReturn:number; // cod hoàn
}