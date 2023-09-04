import { GeneralModel } from "./general.model";
import { PriceList } from "./priceList.model";
import { Service } from "./service.model";
import { AreaGroup } from "./areaGroup.model";
import { WeightGroup } from "./weightGroup.model";


export class PriceService extends GeneralModel {

    priceListId: number;
    priceList: PriceList;
    areaGroupId: number;
    areaGroup: AreaGroup;
    weightGroupId: number;
    weightGroup: WeightGroup;
    serviceId: number;
    service: Service;
    isAuto: boolean;
    vatPercent: number;
    fuelPercent: number;
    dim: number;
    remoteAreasPricePercent: number;
    isTwoWay: boolean;
    isPublic: boolean;
    structureId: number;
    pricingTypeId: number;
    numOrder: number;
    isKeepWeight: boolean;

    publicDateFrom: any;
    publicDateTo: any;

    vatSurcharge: number;
}