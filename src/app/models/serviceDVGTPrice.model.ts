import { GeneralModel } from "./general.model";
import { Formula } from "./formula.model";
import { ServiceDVGT } from "./serviceDVGT.model";
import { CalculateBy } from ".";
import { PriceListDVGT } from "./priceListDVGT.model";


export class ServiceDVGTPrice extends GeneralModel {
    serviceDVGTId: number;
    serviceDVGT: ServiceDVGT;
    formulaId: number;
    formula:Formula;
    valueFrom: number;
    valueTo: number;
    valuePlus: number;
    price: number;
    vseOracleCode: string;
    priceListDVGTId: number;
    priceListDVGT: PriceListDVGT;
    calculateById: number;
    calculateBy: CalculateBy;
}