import { IBaseModel } from "./abstract/ibaseModel.interface";
export class ReportDelivery implements IBaseModel {
    id: number;
    code: string;
    name: string;
    userId: number;
    fullName: string;
    totalListGoods: number;
    totalListGoodsRecived: number;
    totalShipmentWaiting: number;
    totalShipmentDelivering: number;
    totalShipmentDeliveryFaile: number;
    totalShipmentDelivered: number;
}