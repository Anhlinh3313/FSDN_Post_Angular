
import { PriceServiceP } from "./priceServiceP.model";
import { PriceDVGT } from "./priceDVGT.model";


export class Price {

    defaultPrice: number;
    defaultPriceS: number;
    defaultPriceP: number;
    totalDVGT: number;
    remoteAreasPrice: number;
    fuelPrice: number;
    otherPrice: number;
    vatPrice: number;
    totalPrice: number;
    priceDVGTs: PriceDVGT[];
    priceService : PriceServiceP;
    dim: number;
    priceReturn: number;
    priceCOD: number;
    totalPriceSYS: number;
    deadlineDelivery: any;

}