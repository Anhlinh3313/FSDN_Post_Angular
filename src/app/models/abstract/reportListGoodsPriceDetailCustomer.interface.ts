import { Shipment } from "..";

export interface ReportListGoodsPriceDetailCustomer {
      id: number;
      shipmentNumber: string;
      orderDate: any;
      fromProvinceId?: number;
      fromProvinceCode: string;
      fromProvinceName: string;
      toProvinceId?: number;
      toProvinceCode: string;
      toProvinceName: string;
      weight:number;
      structureId?: number;
      structureCode: string;
      structureName: string;
      defaultPrice: number;
      otherPrice: number;
      totalDVGT: number;
      totalPrice: number;
      remoteAreasPrice: number;
      fuelPrice: number;
      vatPrice: number;
      senderId: number;
      customerTypeId: number;
      senderPhone: string;
      senderCode: string;
      senderName: string;
      senderFax: string;
      senderTaxCode: string;
}