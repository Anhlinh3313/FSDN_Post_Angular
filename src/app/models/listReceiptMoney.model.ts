import { GeneralModel } from "./general.model";
import { ListReceiptMoneyStatus } from "./listReceiptMoneyStatus.model";
import { ListReceiptMoneyType } from "./listReceiptMoneyType.model";
import { Hub } from "./hub.model";
import { User } from "./user.model";

export class ListReceiptMoney extends GeneralModel {
    fromHubId: number;
    toHubId: number;
    paidByEmpId: number;
    totalShipment: number;
    totalCOD: number;
    totalPrice: number;
    grandTotal: number;
    grandTotalReal: number = 0;
    attachmentId: number;
    orderDate: Date;
    createdWhen: Date;
    listReceiptMoneyStatusId: number;
    listReceiptMoneyTypeId: number;
    listReceiptMoneyType: ListReceiptMoneyType;
    listReceiptMoneyStatus: ListReceiptMoneyStatus;
    fromHub: Hub;
    toHub: Hub;
    isTransfer: boolean = false;
    feeBank: number = 0;
    userCreated: User;
    accountingAccount: GeneralModel;
    accountingAccountId: number = null;
    warningNote: string;
    seen: boolean;
    cashFlowId?: number = null;
}