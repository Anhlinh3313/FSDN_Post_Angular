import { GeneralModel } from "./general.model";
import { WeightGroup } from "./weightGroup.model";
import {Formula} from "./formula.model";
import { Structure } from "./structure.model";


export class Weight extends GeneralModel {
    weightGroupId: number;
    weightGroup: WeightGroup;
    formulaId: number;
    formula: Formula;
    weightFrom: number;
    weightTo: number;
    weightPlus: number;
    isAuto: boolean;
    isWeightCal: boolean;
    structureId: number;
    structure: Structure;
    valueFrom: number;
    valueTo: number;
    priceServiceId: number;
}