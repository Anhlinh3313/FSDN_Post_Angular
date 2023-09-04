import { GeneralModel } from "./general.model";

export class PriceListDVGT extends GeneralModel {

    code: string;
    name: string;
    isPublic: boolean;
    numOrder: number;
    serviceId: number;
    vatPercent: number;
}