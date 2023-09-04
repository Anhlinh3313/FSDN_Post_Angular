export interface ReportPrintShipment {
    shipmentId: number;
    shipmentNumber: number;
    createdWhen: any;
    totalPrintDetail: number;
    totalPrintCodeA4: number;
    totalPrintSticker: number;
    totalPrintBillAndAdviceOfDelivery: number;
    totalPrintAdviceOfDelivery: number;
    totalPrintBox: number;
    totalPrintPickup: number;
}