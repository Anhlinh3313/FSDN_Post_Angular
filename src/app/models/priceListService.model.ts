import { GeneralModel } from "./general.model";

export class PriceListService extends GeneralModel {
    price: number;
    expectedDeliveryTime: Date;
}