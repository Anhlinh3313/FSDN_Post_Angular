export class ListCustomerPaymentViewModel {
    id: number;
    hubCreatedId: number;
    customerId: number;
    totalShipment: number;
    grandTotal: number;
    adjustPrice: number;
    attachmentId: number;
    shipmentIds: number[] = [];
    dateFrom: Date;
    dateTo: Date;
    listCustomerPaymentTypeId: number = 1;
    note: string;
    locked: boolean;
}