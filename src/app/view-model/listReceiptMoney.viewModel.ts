export class ListReceiptMoneyViewModel {
    id: number;
    fromHubId: number;
    toHubId: number;
    paidByEmpId: number;
    totalShipment: number;
    totalCOD: number;
    totalPrice: number;
    grandTotal: number;
    grandTotalReal: number;
    attachmentId: number;
    shipments: any[];
    note: string;
    bankAccount: string;
    paymentDate: Date;
    feeBank: number = 0;
    accountingAccountId: number;
    lockDate: any;
    acceptDate: any;
    warningNote: string;
}
// export class ShipmentToReceipt
// {
//     id : number;
//     cOD: number;
//     totalPrice:number;
// }