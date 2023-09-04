import { GeneralModel } from "./general.model";
import { ListReceiptMoney, Shipment } from "./index";

export class ListReceiptMoneyShipment extends GeneralModel {
    listReceiptMoneyId: number;
    shipmentId: number;
    cod: number;
    totalPrice: number;
    totalCOD: number;
    listReceiptMoney : ListReceiptMoney;
    shipment: Shipment;
}