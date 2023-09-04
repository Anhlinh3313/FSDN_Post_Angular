import { GeneralModel } from "./general.model";
import { District } from "./district.model";

export class Ward extends GeneralModel {
    districtId: number;
    district: District;
}