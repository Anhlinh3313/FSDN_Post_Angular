import { GeneralModel } from "./general.model";
import { PriceList } from "./priceList.model";
import { Service } from "./service.model";
import { AreaGroup } from "./areaGroup.model";
import { WeightGroup } from "./weightGroup.model";
import { PackType } from "./packType.model";
import { Formula } from "./formula.model";


export class PackagePrice extends GeneralModel {

    code: string;
    name: string;
    valueFrom: number;
    valueTo: number;
    price: number;
    packType: PackType;
    packTypeId: number;
    formular: Formula;
    formulaId: number;
}