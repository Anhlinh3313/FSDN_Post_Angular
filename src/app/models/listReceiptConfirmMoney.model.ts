import { GeneralModel } from "./general.model";
import { ListReceiptMoneyType } from "./listReceiptMoneyType.model";

export class ListReceiptConfirmMoney extends GeneralModel {
    fromHubId: number;
    toHubId: number;
    paidByEmpId: number;
    totalShipment: number;
    totalCOD: number;
    totalPrice: number;
    grandTotal: number;
    attachmentId: number;
    listReceiptMoneyTypeId: number;
    listReceiptMoneyType: ListReceiptMoneyType;
}