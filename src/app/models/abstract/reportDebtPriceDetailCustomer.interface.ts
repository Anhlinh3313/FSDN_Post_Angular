import { Shipment } from "..";

export interface ReportDebtPriceDetailCustomer extends Shipment {
      id: number;
      code: string;
      name: string;
      customerTypeId:number;
      totalBefore:number;
      totalPrice:number;
      totalPricePaid:number;
      totalCOD:number;
      totalCODPaid:number;
      totalAfter:number;
}