import { GeneralModel } from "./general.model";
import { Service } from "./service.model";
import { Area } from "./area.model";
import { Weight } from "./weight.model";
import { PriceService } from "./priceService.model";


export class PriceServiceDetail extends GeneralModel {

    priceServiceId: number;
    priceService: PriceService;
    weightId: number;
    weight: Weight;
    areaId: number;
    area: Area;
    price: number;
}