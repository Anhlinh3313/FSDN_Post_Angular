import { GeneralModel } from "./general.model";
import { Province, Ward } from ".";
import { District } from "./district.model";

export class CusDepartment extends GeneralModel {
    customerId: number;
    address: string;
    addressNote: string;
    phoneNumber: string;
    representativeName: string;
    provinceId: number;
    districtId: number;
    wardId: number;
    lat: number;
    lng: number;
    province: Province;
    district: District;
    ward: Ward;
    createdWhen: any;
    createdBy: number;
    modifiedWhen: any;
    modifiedBy: number;
}