import { GeneralModel } from "./general.model";

export class HubTransfer extends GeneralModel {
    totalListGoods: number;
    totalListGoodsSend: number;
    totalListGoodsSendWaiting: number;
    totalListGoodsSendTransfering: number;
    totalListGoodsSendComplete: number;
    totalListGoodsSendCancel: number;
    totalListGoodsSendTo: number;
    totalListGoodsSendToWaiting: number;
    totalListGoodsSendToTransfering: number;
    totalListGoodsSendToComplete: number;
    totalListGoodsSendToCancel: number;
    totalListGoodsReceived: number
}