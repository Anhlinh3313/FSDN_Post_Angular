import { GeneralModel } from "./general.model";
import { Hub } from "./hub.model";


export class PriceList extends GeneralModel {

    hubId: number;
    hub: Hub;
    fuelSurcharge: number;
    remoteSurcharge: number;
    publicDateFrom: any;
    publicDateTo: any;
    isPublic:boolean;
    isShared:boolean;
    numOrder: number;
    priceListDVGTId: number;
    VATSurcharge: number;
}